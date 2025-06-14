"use client"
import { useState, useEffect } from "react"
import { Copy, Check, Clock, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import Image from "next/image"

interface RealPixQRCodeProps {
  amount: number
  customerName: string
  customerCpf: string
  customerEmail: string
  onPaymentConfirmed?: () => void
}

interface SkalepayResponse {
  success: boolean
  data?: {
    id: string
    status: string
    amount: number
    paymentMethod: string
    pix?: {
      qrcode: string // Este é o código copia e cola
    }
    expiresAt?: string
    createdAt?: string
    customer?: any
    items?: any[]
  }
  error?: string
  details?: any
}

export default function RealPixQRCode({
  amount,
  customerName,
  customerCpf,
  customerEmail,
  onPaymentConfirmed,
}: RealPixQRCodeProps) {
  const [pixData, setPixData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [checkingPayment, setCheckingPayment] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "expired">("pending")
  const [retryCount, setRetryCount] = useState(0)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [lastStatusCheck, setLastStatusCheck] = useState<Date | null>(null)

  // Gerar PIX quando componente montar
  useEffect(() => {
    generatePix()
  }, [])

  // Verificar status do pagamento periodicamente - MAIS FREQUENTE
  useEffect(() => {
    if (pixData?.transaction_id && paymentStatus === "pending") {
      // Primeira verificação após 10 segundos
      const initialTimeout = setTimeout(() => {
        checkPaymentStatus()
      }, 10000)

      // Verificações subsequentes a cada 10 segundos
      const interval = setInterval(() => {
        checkPaymentStatus()
      }, 10000)

      return () => {
        clearTimeout(initialTimeout)
        clearInterval(interval)
      }
    }
  }, [pixData, paymentStatus])

  // Atualizar contador de tempo
  useEffect(() => {
    if (pixData?.expires_at) {
      const interval = setInterval(() => {
        updateTimeLeft()
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [pixData])

  const generatePix = async () => {
    try {
      setLoading(true)
      setError(null)
      setDebugInfo(null)

      console.log("🚀 Iniciando geração de PIX...")

      // Validações no frontend
      if (!amount || amount <= 0) {
        throw new Error("Valor inválido")
      }

      if (!customerName || customerName.trim().length < 2) {
        throw new Error("Nome inválido")
      }

      if (!customerCpf || customerCpf.replace(/\D/g, "").length !== 11) {
        throw new Error("CPF inválido")
      }

      if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        throw new Error("E-mail inválido")
      }

      const requestData = {
        amount: amount.toString(),
        description: `Programa Luz do Povo - Taxa Residual - ${customerName}`,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerDocument: customerCpf,
      }

      console.log("📤 Enviando requisição:", requestData)

      const response = await fetch("/api/pix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const responseData: SkalepayResponse = await response.json()

      console.log("📨 Resposta completa recebida:", responseData)

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error || `Erro ${response.status}`)
      }

      if (!responseData.data?.id) {
        throw new Error("Resposta inválida da API: ID da transação não encontrado")
      }

      // Extrair dados da resposta da SkalePay
      const skalepayData = responseData.data

      // Buscar código PIX no campo pix.qrcode
      const pixCopiaCola = skalepayData.pix?.qrcode

      console.log("🔍 Dados extraídos:", {
        id: skalepayData.id,
        pixCopiaCola: pixCopiaCola ? "Presente" : "Ausente",
        pixLength: pixCopiaCola ? pixCopiaCola.length : 0,
        status: skalepayData.status,
        amount: skalepayData.amount,
      })

      if (!pixCopiaCola) {
        console.warn("⚠️ Código PIX copia e cola não encontrado na resposta")
      }

      // Adaptar os dados para o formato esperado pelo componente
      const adaptedData = {
        success: true,
        transaction_id: skalepayData.id,
        amount: skalepayData.amount ? skalepayData.amount / 100 : amount,
        status: skalepayData.status || "pending",
        pix_copia_cola: pixCopiaCola,
        expires_at: skalepayData.expiresAt,
        created_at: skalepayData.createdAt,
        api_method: "SkalePay API v2",
        is_real: true,
        raw_data: skalepayData,
      }

      console.log("✅ Dados adaptados:", adaptedData)

      setPixData(adaptedData)
      setPaymentStatus("pending")
      setRetryCount(0)
      setDebugInfo({
        api_method: "SkalePay API v2",
        is_real: true,
        transaction_id: skalepayData.id,
        has_pix_code: !!pixCopiaCola,
        pix_code_length: pixCopiaCola ? pixCopiaCola.length : 0,
        original_response: skalepayData,
      })

      console.log("✅ PIX gerado com sucesso:", skalepayData.id)
    } catch (err) {
      console.error("❌ Erro ao gerar PIX:", err)

      let errorMessage = "Erro desconhecido"

      if (err instanceof Error) {
        errorMessage = err.message

        if (err.message.includes("Failed to fetch")) {
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente."
        } else if (err.message.includes("timeout")) {
          errorMessage = "Timeout na conexão. Tente novamente."
        } else if (err.message.includes("401")) {
          errorMessage = "Erro de autenticação do sistema."
        } else if (err.message.includes("400")) {
          errorMessage = "Dados inválidos. Verifique as informações."
        } else if (err.message.includes("503")) {
          errorMessage = "Sistema de pagamento temporariamente indisponível."
        } else if (err.message.includes("500")) {
          errorMessage = "Erro interno do servidor. Tente novamente em alguns minutos."
        }
      }

      setError(errorMessage)
      setDebugInfo({
        error_type: err instanceof Error ? err.name : "Unknown",
        error_message: err instanceof Error ? err.message : String(err),
        retry_count: retryCount,
      })
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!pixData?.transaction_id || checkingPayment) return

    try {
      setCheckingPayment(true)
      setLastStatusCheck(new Date())

      console.log("🔍 Verificando status do pagamento:", pixData.transaction_id)

      const response = await fetch(`/api/pix?transaction_id=${pixData.transaction_id}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      const data: SkalepayResponse = await response.json()

      console.log("📊 Status verificado:", {
        success: data.success,
        status: data.data?.status,
        timestamp: new Date().toISOString(),
      })

      if (data.success && data.data) {
        const currentStatus = data.data.status

        // Verificar diferentes possíveis status de pagamento confirmado
        if (
          (currentStatus === "paid" ||
            currentStatus === "approved" ||
            currentStatus === "confirmed" ||
            currentStatus === "completed") &&
          paymentStatus !== "paid"
        ) {
          console.log("✅ PAGAMENTO CONFIRMADO! Status:", currentStatus)
          setPaymentStatus("paid")

          // Chamar callback imediatamente
          if (onPaymentConfirmed) {
            console.log("🎉 Chamando callback de pagamento confirmado")
            onPaymentConfirmed()
          }
        } else if (currentStatus === "expired" || currentStatus === "cancelled") {
          console.log("⏰ Pagamento expirado/cancelado:", currentStatus)
          setPaymentStatus("expired")
        } else {
          console.log("⏳ Pagamento ainda pendente:", currentStatus)
        }
      } else {
        console.warn("⚠️ Resposta inválida ao verificar status:", data)
      }
    } catch (err) {
      console.error("❌ Erro ao verificar status:", err)
    } finally {
      setCheckingPayment(false)
    }
  }

  const updateTimeLeft = () => {
    if (!pixData?.expires_at) return

    const now = new Date().getTime()
    const expiresAt = new Date(pixData.expires_at).getTime()
    const difference = expiresAt - now

    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      )
    } else {
      setTimeLeft("Expirado")
      setPaymentStatus("expired")
    }
  }

  const handleCopyPixCode = async () => {
    const pixCode = pixData?.pix_copia_cola

    if (!pixCode) {
      console.error("❌ Código PIX não encontrado")
      alert("Código PIX não disponível. Tente gerar novamente.")
      return
    }

    try {
      console.log("📋 Copiando código PIX:", pixCode.substring(0, 50) + "...")
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
      console.log("✅ Código PIX copiado com sucesso")
    } catch (err) {
      console.error("❌ Erro ao copiar:", err)
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement("textarea")
      textArea.value = pixCode
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand("copy")
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
        console.log("✅ Código PIX copiado via fallback")
      } catch (fallbackErr) {
        console.error("❌ Fallback também falhou:", fallbackErr)
        alert("Código PIX: " + pixCode)
      }
      document.body.removeChild(textArea)
    }
  }

  const handleRetry = () => {
    setRetryCount(retryCount + 1)
    generatePix()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-sm mx-auto">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-900 mb-4"></div>
        <p className="text-blue-900 font-medium text-sm sm:text-base">Gerando PIX...</p>
        <p className="text-xs sm:text-sm text-gray-600 text-center mt-2">
          {retryCount > 0 ? `Tentativa ${retryCount + 1}` : "Conectando com sistema de pagamento"}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-sm mx-auto border-l-4 border-red-500">
        <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mb-4" />
        <p className="text-red-700 font-medium mb-2 text-sm sm:text-base">Erro ao gerar PIX</p>
        <p className="text-xs sm:text-sm text-gray-600 text-center mb-4">{error}</p>

        <button
          onClick={handleRetry}
          className="w-full bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors flex items-center justify-center text-sm sm:text-base"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente ({retryCount + 1})
        </button>
      </div>
    )
  }

  if (!pixData) {
    return null
  }

  // Pagamento confirmado - VISUAL MELHORADO
  if (paymentStatus === "paid") {
    return (
      <div className="flex flex-col items-center bg-green-50 p-4 sm:p-6 rounded-lg shadow-md w-full max-w-sm mx-auto border-l-4 border-green-500">
        <div className="relative">
          <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-green-600 mb-4" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-white" />
          </div>
        </div>
        <p className="text-green-800 font-bold text-lg sm:text-xl mb-2">Pagamento Confirmado!</p>
        <p className="text-sm sm:text-base text-green-700 text-center mb-2">Valor: {formatCurrency(amount)}</p>
        <p className="text-xs text-green-600 text-center mb-4">Confirmado em: {new Date().toLocaleString("pt-BR")}</p>
        <div className="w-full p-3 bg-green-100 rounded-lg">
          <p className="text-xs text-green-800 text-center font-medium">
            ✅ Benefício será ativado automaticamente em até 24 horas
          </p>
        </div>
      </div>
    )
  }

  // PIX expirado
  if (paymentStatus === "expired") {
    return (
      <div className="flex flex-col items-center bg-red-50 p-4 sm:p-6 rounded-lg shadow-md w-full max-w-sm mx-auto border-l-4 border-red-500">
        <Clock className="h-12 w-12 sm:h-16 sm:w-16 text-red-600 mb-4" />
        <p className="text-red-800 font-bold text-base sm:text-lg mb-2">PIX Expirado</p>
        <p className="text-xs sm:text-sm text-red-700 text-center mb-4">Gere um novo código para continuar</p>
        <button
          onClick={handleRetry}
          className="w-full bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors text-sm sm:text-base"
        >
          Gerar novo PIX
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center mb-4 w-full">
        <p className="font-bold text-blue-900 text-base sm:text-lg">ANEEL</p>
        <p className="text-xs sm:text-sm text-gray-600">Programa Luz do Povo</p>
        <p className="text-xs text-gray-500">Taxa Residual</p>
      </div>

      {/* Ícone PIX - SEM QR CODE */}
      <div className="border-4 border-blue-900 p-6 sm:p-8 rounded-lg mb-4 bg-gradient-to-br from-blue-50 to-blue-100 w-full max-w-[200px]">
        <div className="flex flex-col items-center justify-center">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg/800px-Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg.png"
            alt="Logo PIX"
            width={120}
            height={60}
            className="mb-3"
          />
          <p className="text-blue-900 font-bold text-base sm:text-lg">PIX</p>
          <p className="text-xs sm:text-sm text-blue-700">Copia e Cola</p>
        </div>
      </div>

      {/* Valor */}
      <div className="text-center mb-4 w-full">
        <p className="font-bold text-xl sm:text-2xl text-blue-900 mb-2">{formatCurrency(amount)}</p>
        <p className="text-xs sm:text-sm text-gray-600 break-all">ID: {pixData?.transaction_id}</p>
      </div>

      {/* Tempo restante */}
      {timeLeft && paymentStatus === "pending" && (
        <div className="flex items-center justify-center mb-4 p-2 bg-yellow-50 rounded-lg w-full">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 mr-2" />
          <span className="text-xs sm:text-sm font-medium text-yellow-800">
            {timeLeft === "Expirado" ? "Código expirado" : `Expira em: ${timeLeft}`}
          </span>
        </div>
      )}

      {/* Status de verificação - MELHORADO */}
      {checkingPayment && (
        <div className="flex items-center justify-center mb-4 p-2 bg-blue-50 rounded-lg w-full">
          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-xs sm:text-sm text-blue-800">Verificando pagamento...</span>
        </div>
      )}

      {/* Última verificação */}
      {lastStatusCheck && paymentStatus === "pending" && (
        <div className="mb-4 p-2 bg-gray-50 rounded-lg w-full">
          <p className="text-xs text-gray-600 text-center">
            Última verificação: {lastStatusCheck.toLocaleTimeString("pt-BR")}
          </p>
        </div>
      )}

      {/* Botão copiar - RESPONSIVO */}
      <button
        onClick={handleCopyPixCode}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center text-sm sm:text-base ${
          copied ? "bg-green-600 text-white" : "bg-blue-900 text-white hover:bg-blue-800 active:bg-blue-950"
        } ${paymentStatus !== "pending" || !pixData?.pix_copia_cola ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={paymentStatus !== "pending" || !pixData?.pix_copia_cola}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Código copiado!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            {pixData?.pix_copia_cola ? "Copiar código PIX" : "Código PIX indisponível"}
          </>
        )}
      </button>

      {/* Mostrar código PIX se disponível - RESPONSIVO */}
      {pixData?.pix_copia_cola && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg w-full">
          <p className="text-xs font-medium text-gray-600 mb-2">Código PIX (Copia e Cola):</p>
          <div className="bg-white p-2 sm:p-3 rounded border">
            <p className="text-xs font-mono break-all leading-relaxed text-gray-800">{pixData.pix_copia_cola}</p>
          </div>
        </div>
      )}

      {/* Instruções - RESPONSIVO */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg w-full">
        <p className="text-xs text-gray-600 text-center leading-relaxed">
          <strong>Como pagar:</strong>
          <br />
          1. Abra o app do seu banco
          <br />
          2. Escolha PIX → Copia e Cola
          <br />
          3. Cole o código PIX copiado
          <br />
          4. Confirme o pagamento
          <br />
          <span className="text-blue-600 font-medium">⚡ O pagamento será detectado automaticamente</span>
        </p>
      </div>

      {/* Segurança */}
      <div className="mt-3 p-2 bg-blue-50 rounded w-full">
        <p className="text-xs text-blue-800 text-center">🔒 Pagamento seguro</p>
      </div>
    </div>
  )
}
