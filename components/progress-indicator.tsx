"use client"

import { useState, useEffect } from "react"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  label?: string
}

export function ProgressIndicator({ currentStep, totalSteps, label }: ProgressIndicatorProps) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    // Animação suave da barra de progresso
    const timer = setTimeout(() => {
      setWidth((currentStep / totalSteps) * 100)
    }, 100)

    return () => clearTimeout(timer)
  }, [currentStep, totalSteps])

  return (
    <div className="progress-container">
      <div className="progress-text">{label || `Etapa ${currentStep} de ${totalSteps}`}</div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}
