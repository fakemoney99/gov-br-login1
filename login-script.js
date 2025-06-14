document.addEventListener("DOMContentLoaded", () => {
  const cpfInput = document.getElementById("cpf")
  const continueButton = document.getElementById("continue-button")
  const errorMessage = document.querySelector(".error-message")
  const successIcon = document.querySelector(".success-icon")
  const errorIcon = document.querySelector(".error-icon")
  const loadingIcon = document.querySelector(".loading-icon")
  const verificationScreen = document.getElementById("verification-screen")
  const terminalContent = document.getElementById("terminal-content")
  const nextButton = document.getElementById("next-button")

  // Format CPF as user types
  cpfInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "")

    if (value.length > 11) {
      value = value.slice(0, 11)
    }

    if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`
    }

    e.target.value = value

    // Reset validation state
    cpfInput.classList.remove("valid", "invalid")
    errorMessage.textContent = ""
    successIcon.style.display = "none"
    errorIcon.style.display = "none"
    loadingIcon.style.display = "none"
    continueButton.disabled = true

    // Validate when CPF is complete
    if (value.length === 14) {
      validateCPF(value)
    }
  })

  // Validate CPF
  function validateCPF(cpf) {
    // Show loading state
    loadingIcon.style.display = "block"

    // Simulate API validation delay
    setTimeout(() => {
      const isValid = checkCPFDigits(cpf)

      loadingIcon.style.display = "none"

      if (isValid) {
        cpfInput.classList.add("valid")
        successIcon.style.display = "block"
        continueButton.disabled = false
      } else {
        cpfInput.classList.add("invalid")
        errorIcon.style.display = "block"
        errorMessage.textContent = "CPF inválido. Verifique os números digitados."
        continueButton.disabled = true
      }
    }, 800)
  }

  // CPF validation algorithm
  function checkCPFDigits(cpf) {
    const cleanCPF = cpf.replace(/\D/g, "")

    // Check if all digits are the same
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
      return false
    }

    // First verification digit
    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += Number.parseInt(cleanCPF.charAt(i)) * (10 - i)
    }

    let remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) {
      remainder = 0
    }

    if (remainder !== Number.parseInt(cleanCPF.charAt(9))) {
      return false
    }

    // Second verification digit
    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += Number.parseInt(cleanCPF.charAt(i)) * (11 - i)
    }

    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) {
      remainder = 0
    }

    if (remainder !== Number.parseInt(cleanCPF.charAt(10))) {
      return false
    }

    return true
  }

  // Continue button click handler
  continueButton.addEventListener("click", () => {
    // Show verification screen
    verificationScreen.classList.remove("hidden")

    // Start terminal animation
    startTerminalAnimation()
  })

  // Terminal animation
  function startTerminalAnimation() {
    const messages = [
      "Iniciando verificação de segurança...",
      "Conectando ao servidor gov.br...",
      "Verificando CPF...",
      "Autenticando usuário...",
      "Nome completo: Maria da Silva",
      "Data de Nascimento: 15/05/1985",
      "Verificando certificados de segurança...",
      "Estabelecendo conexão segura...",
      "Preparando ambiente do usuário...",
      "Verificação concluída com sucesso!",
    ]

    let index = 0
    const interval = setInterval(() => {
      if (index < messages.length) {
        addTerminalLine(messages[index], index === 4 || index === 5)
        index++
      } else {
        clearInterval(interval)
        nextButton.classList.remove("hidden")
      }
    }, 800)
  }

  // Add line to terminal
  function addTerminalLine(text, isUserData = false) {
    const line = document.createElement("div")
    line.className = "terminal-line"

    const prompt = document.createElement("span")
    prompt.className = "terminal-prompt"
    prompt.textContent = "$ "

    const content = document.createElement("span")
    content.className = isUserData ? "terminal-text user-data" : "terminal-text"

    // Simulate typing effect
    let charIndex = 0
    const typing = setInterval(() => {
      if (charIndex < text.length) {
        content.textContent += text.charAt(charIndex)
        charIndex++
      } else {
        clearInterval(typing)
      }
    }, 20)

    line.appendChild(prompt)
    line.appendChild(content)
    terminalContent.appendChild(line)

    // Scroll to bottom
    terminalContent.scrollTop = terminalContent.scrollHeight
  }

  // Next button click handler
  nextButton.addEventListener("click", () => {
    // Redirect to result page or show success message
    alert("Parabéns! Você tem direito ao benefício do Programa Luz do Povo. Em breve você receberá mais informações.")
  })
})
