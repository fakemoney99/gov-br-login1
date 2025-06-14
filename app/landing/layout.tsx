import type React from "react"
import "./landing.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Programa Luz do Povo - Governo Federal",
  description: "Conheça o programa Luz do Povo do Governo Federal que beneficia milhões de brasileiros",
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Add preconnect for faster loading */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Load Material Icons with correct crossOrigin */}
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

      {/* Load Rawline font */}
      <link href="https://fonts.googleapis.com/css2?family=Rawline:wght@400;500;700&display=swap" rel="stylesheet" />

      {children}
    </>
  )
}
