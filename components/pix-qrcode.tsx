"use client"

import Image from "next/image"
import { useState } from "react"

interface PixQRCodeProps {
  value?: string
}

export function PixQRCode({ value = "37,90" }: PixQRCodeProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    // Código PIX fictício
    const pixCode =
      "00020126580014BR.GOV.BCB.PIX0136ANEEL.PROGRAMA.LUZ.POVO@GOV.BR5204000053039865802BR5924ANEEL PROGRAMA LUZ POVO6009SAO PAULO62070503***63041D57"

    navigator.clipboard.writeText(pixCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    })
  }

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-lg">
      <div className="text-center mb-3">
        <p className="font-bold text-blue-900">ANEEL - Agência Nacional de Energia Elétrica</p>
        <p className="text-sm text-gray-600">Pagamento de Residual para Adesão ao Programa</p>
      </div>

      <div className="border-4 border-blue-900 p-2 rounded-lg mb-3">
        <Image
          src="/placeholder.svg?height=200&width=200"
          alt="QR Code PIX"
          width={200}
          height={200}
          className="mx-auto"
        />
      </div>

      <div className="text-center">
        <p className="font-bold text-lg">Valor: R$ {value}</p>
        <p className="text-sm text-gray-600 mt-1">Chave PIX: 00.000.000/0001-00</p>
        <p className="text-sm text-gray-600">Beneficiário: ANEEL - Programa Luz do Povo</p>
      </div>

      <button
        onClick={handleCopy}
        className="mt-3 bg-blue-900 text-white py-2 px-4 rounded w-full hover:bg-blue-800 transition-colors"
      >
        {copied ? "Código copiado!" : "Copiar código PIX"}
      </button>

      <div className="mt-3 p-2 bg-gray-100 rounded w-full">
        <p className="text-xs text-center text-gray-500">Este código expira em 24 horas</p>
      </div>
    </div>
  )
}
