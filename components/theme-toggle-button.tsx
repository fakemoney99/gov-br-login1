"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"

interface ThemeToggleButtonProps {
  className?: string
}

export function ThemeToggleButton({ className = "" }: ThemeToggleButtonProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Verifica se há preferência salva
    const savedTheme = localStorage.getItem("chatTheme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.body.classList.add("dark-theme")
    }

    // Verifica preferência do sistema
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    if (!savedTheme && prefersDark) {
      setIsDarkMode(true)
      document.body.classList.add("dark-theme")
    }
  }, [])

  const toggleTheme = () => {
    if (isDarkMode) {
      document.body.classList.remove("dark-theme")
      localStorage.setItem("chatTheme", "light")
    } else {
      document.body.classList.add("dark-theme")
      localStorage.setItem("chatTheme", "dark")
    }
    setIsDarkMode(!isDarkMode)
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors ${className}`}
      aria-label={isDarkMode ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {isDarkMode ? <Sun className="h-5 w-5 text-yellow-300" /> : <Moon className="h-5 w-5 text-blue-300" />}
    </button>
  )
}
