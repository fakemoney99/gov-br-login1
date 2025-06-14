import { type NextRequest, NextResponse } from "next/server"

const SKALEPAY_SECRET_KEY = "sk_live_v2Xi6x35K2oTiYQxAw0OYSsuXQVe2CEJldMqFBcqng"

// Função para limpar documento (remover pontos, traços, etc.)
function cleanDocument(document: string): string {
  return document.replace(/\D/g, "")
}

// Função para determinar tipo do documento
function getDocumentType(document: string): "cpf" | "cnpj" {
  const cleanDoc = cleanDocument(document)
  return cleanDoc.length <= 11 ? "cpf" : "cnpj"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, description, customerName, customerEmail, customerDocument } = body

    console.log("📥 Dados recebidos:", {
      amount,
      description,
      customerName,
      customerEmail: customerEmail?.replace(/(.{2}).*(@.*)/, "$1***$2"),
      customerDocument: customerDocument?.replace(/\d/g, "*"),
    })

    // Validações
    if (!amount || !description || !customerName || !customerEmail || !customerDocument) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados obrigatórios não fornecidos",
          required: ["amount", "description", "customerName", "customerEmail", "customerDocument"],
        },
        { status: 400 },
      )
    }

    // Converter valor para centavos
    const amountInCents = Math.round(Number.parseFloat(amount) * 100)

    // Limpar e processar documento
    const cleanDoc = cleanDocument(customerDocument)
    const docType = getDocumentType(cleanDoc)

    console.log("🔄 Processando:", {
      amountInCents,
      cleanDoc: cleanDoc.replace(/\d/g, "*"),
      docType,
    })

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${SKALEPAY_SECRET_KEY}:x`).toString("base64"),
      },
      body: JSON.stringify({
        paymentMethod: "pix",
        amount: amountInCents,
        items: [
          {
            title: description.substring(0, 500), // Limitar a 500 caracteres
            quantity: 1,
            unitPrice: amountInCents,
            tangible: false, // PIX geralmente é para serviços/produtos digitais
          },
        ],
        customer: {
          name: customerName,
          email: customerEmail,
          document: {
            number: cleanDoc,
            type: docType,
          },
        },
      }),
    }

    console.log("🚀 Enviando para SkalePay...")

    const response = await fetch("https://api.conta.skalepay.com.br/v1/transactions", options)
    const data = await response.json()

    console.log("📨 Resposta SkalePay:", {
      status: response.status,
      success: response.ok,
      dataKeys: Object.keys(data),
    })

    if (!response.ok) {
      console.error("❌ Erro da SkalePay:", data)
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Erro na API da Skalepay",
          details: data,
        },
        { status: response.status },
      )
    }

    console.log("✅ PIX criado com sucesso!")

    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error) {
    console.error("💥 Erro ao processar requisição:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

// Manter o GET para consulta de status (se necessário)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("transaction_id")

    if (!transactionId) {
      return NextResponse.json({ error: "transaction_id é obrigatório" }, { status: 400 })
    }

    console.log("🔍 Consultando transação:", transactionId)

    const options = {
      method: "GET",
      headers: {
        Authorization: "Basic " + Buffer.from(`${SKALEPAY_SECRET_KEY}:x`).toString("base64"),
      },
    }

    const response = await fetch(`https://api.conta.skalepay.com.br/v1/transactions/${transactionId}`, options)
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Erro ao consultar transação",
        },
        { status: response.status },
      )
    }

    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error) {
    console.error("💥 Erro ao consultar transação:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
