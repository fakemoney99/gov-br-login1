"use client"

import { useEffect, useState } from "react"

interface CelebrationProps {
  message?: string
}

export function Celebration({ message = "Parabéns! Você tem direito ao benefício!" }: CelebrationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Pequeno atraso para a animação começar após o componente ser montado
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="celebration-container">
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="confetti-piece"></div>
      <div className="celebration-message">{message}</div>
    </div>
  )
}
