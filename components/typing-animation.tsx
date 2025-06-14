"use client"

import { useEffect, useState } from "react"

interface TypingAnimationProps {
  text: string
  speed?: number
  onComplete?: () => void
}

export function TypingAnimation({ text, speed = 50, onComplete }: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  return (
    <div>
      {displayedText}
      {currentIndex < text.length && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>}
    </div>
  )
}
