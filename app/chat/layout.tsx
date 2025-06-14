import type React from "react"
import type { Metadata } from "next"
import "./chat.css"

export const metadata: Metadata = {
  title: "Chat - Programa Luz do Povo",
  description: "Atendimento do Programa Luz do Povo",
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-100">{children}</body>
    </html>
  )
}
