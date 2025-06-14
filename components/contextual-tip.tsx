"use client"

import { useState } from "react"

interface ContextualTipProps {
  tip: string
  icon?: string
}

export function ContextualTip({ tip, icon = "💡" }: ContextualTipProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="tip-container">
      <div className="tip-icon">{icon}</div>
      <div className="tip-text">{tip}</div>
      <button className="tip-close" onClick={() => setIsVisible(false)} aria-label="Fechar dica">
        ×
      </button>
    </div>
  )
}
