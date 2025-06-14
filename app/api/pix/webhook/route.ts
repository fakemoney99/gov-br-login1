import { type NextRequest, NextResponse } from "next/server"

// Endpoint para receber webhooks do SkalePay
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("🔔 Webhook recebido do SkalePay:", JSON.stringify(body, null, 2))

    // Aqui você pode processar as atualizações de status do pagamento
    const { id, status, amount, customer } = body

    if (status === "paid" || status === "confirmed") {
      console.log(`✅ Pagamento confirmado para checkout ${id}`)

      // Aqui você pode:
      // 1. Atualizar o status no banco de dados
      // 2. Enviar email de confirmação
      // 3. Ativar o benefício do usuário
      // 4. Enviar notificação para o frontend

      // Por exemplo, salvar no localStorage simulado:
      // transactions.set(id, { ...existingTransaction, status: "paid", paid_at: new Date().toISOString() })
    }

    // Sempre retornar 200 para confirmar recebimento do webhook
    return NextResponse.json({ received: true, status: "ok" })
  } catch (error) {
    console.error("💥 Erro ao processar webhook:", error)

    // Mesmo com erro, retornar 200 para evitar reenvios desnecessários
    return NextResponse.json({ received: false, error: "Erro interno" }, { status: 200 })
  }
}
