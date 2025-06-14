import type React from "react"
import type { Metadata } from "next"
import "./chat.css"

export const metadata: Metadata = {
  title: "Chat - Programa Luz do Povo",
  description: "Atendimento do Programa Luz do Povo",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
