document.addEventListener("DOMContentLoaded", () => {
  // Accordion functionality
  const accordionItems = document.querySelectorAll(".accordion-item")

  accordionItems.forEach((item) => {
    const header = item.querySelector(".accordion-header")

    header.addEventListener("click", () => {
      // Close all other accordion items
      accordionItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active")
        }
      })

      // Toggle current item
      item.classList.toggle("active")
    })
  })

  // CTA button click handler
  const ctaButton = document.getElementById("btn-goto-login")
  if (ctaButton) {
    ctaButton.addEventListener("click", (e) => {
      // Já está usando um elemento <a> com href para verificar-cpf.html
    })
  }

  // Handle Instagram embed fallback
  const checkEmbedLoaded = setInterval(() => {
    const iframe = document.querySelector(".instagram-media")
    const fallback = document.querySelector(".video-fallback")

    if (iframe) {
      if (iframe.contentDocument === null) {
        // If iframe is blocked or fails to load
        if (fallback) {
          fallback.style.display = "block"
        }
        clearInterval(checkEmbedLoaded)
      } else if (iframe.contentDocument && iframe.contentDocument.body) {
        // If iframe loaded successfully
        if (fallback) {
          fallback.style.display = "none"
        }
        clearInterval(checkEmbedLoaded)
      }
    }
  }, 1000)

  // Add animation on scroll
  const animateOnScroll = () => {
    const elements = document.querySelectorAll(".benefit-card, .eligibility-section, .cta-section")

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top
      const screenPosition = window.innerHeight / 1.3

      if (elementPosition < screenPosition) {
        element.classList.add("animate-fade-in")
      }
    })
  }

  // Add CSS for animation
  const style = document.createElement("style")
  style.innerHTML = `
        .animate-fade-in {
            animation: fadeIn 0.8s ease forwards;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .benefit-card, .eligibility-section, .cta-section {
            opacity: 0;
        }
    `
  document.head.appendChild(style)

  // Run animation on scroll
  window.addEventListener("scroll", animateOnScroll)
  animateOnScroll() // Run once on page load

  // Post interaction simulation
  const likeButton = document.querySelector(".action-buttons .action-button:first-child")
  if (likeButton) {
    likeButton.addEventListener("click", function () {
      const icon = this.querySelector(".material-icons")
      if (icon.textContent === "favorite_border") {
        icon.textContent = "favorite"
        icon.style.color = "#ED4956"

        const likesElement = document.querySelector(".post-likes")
        if (likesElement) {
          likesElement.textContent = "2.007 curtidas"
        }
      } else {
        icon.textContent = "favorite_border"
        icon.style.color = ""

        const likesElement = document.querySelector(".post-likes")
        if (likesElement) {
          likesElement.textContent = "2.006 curtidas"
        }
      }
    })
  }
})
