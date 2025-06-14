"use client"

import { useEffect, useState } from "react"

interface EnhancedTypingAnimationProps {
  text: string
  speed?: number
  onComplete?: () => void
}

export function EnhancedTypingAnimation({ text, speed = 50, onComplete }: EnhancedTypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentIndex < text.length) {
      const randomDelays = [40, 60, 30, 70, 50]

      // Determina o atraso com base no caractere atual
      const char = text[currentIndex - 1]
      let delay = randomDelays[Math.floor(Math.random() * randomDelays.length)]

      // Pausa mais longa em pontuações
      if (char === "." || char === "!" || char === "?") {
        delay = 400
      } else if (char === "," || char === ";" || char === ":") {
        delay = 200
      }

      const timeout = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1))
        setCurrentIndex((prev) => prev + 1)
      }, delay)

      return () => clearTimeout(timeout)
    } else if (!isComplete) {
      setIsComplete(true)
      if (onComplete) {
        onComplete()
      }
    }
  }, [currentIndex, text, onComplete, isComplete])

  return (
    <div>
      {displayedText}
      {!isComplete && <span className="typing-cursor">|</span>}
    </div>
  )
}
