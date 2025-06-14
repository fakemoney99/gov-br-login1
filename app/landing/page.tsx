"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"

export default function LandingPage() {
  const router = useRouter()
  // Use refs to safely reference DOM elements
  const accordionItemsRef = useRef<HTMLDivElement[]>([])
  const likeButtonRef = useRef<HTMLButtonElement | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null)

  useEffect(() => {
    // Handle scroll events for header effects
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)

    // Initialize post interactions with safer DOM access
    const initPostInteractions = () => {
      try {
        const likeButton = document.querySelector<HTMLButtonElement>(".action-buttons .action-button:first-child")
        if (!likeButton) return

        // Store reference
        likeButtonRef.current = likeButton

        likeButton.addEventListener("click", function () {
          const icon = this.querySelector<HTMLSpanElement>(".material-icons")
          if (!icon) return

          if (icon.textContent === "favorite_border") {
            icon.textContent = "favorite"
            icon.style.color = "#ED4956"

            const likesElement = document.querySelector<HTMLDivElement>(".post-likes")
            if (likesElement) {
              likesElement.textContent = "2.007 curtidas"
            }
          } else {
            icon.textContent = "favorite_border"
            icon.style.color = ""

            const likesElement = document.querySelector<HTMLDivElement>(".post-likes")
            if (likesElement) {
              likesElement.textContent = "2.006 curtidas"
            }
          }
        })
      } catch (error) {
        console.error("Error initializing post interactions:", error)
      }
    }

    // Initialize animations for elements
    const initAnimations = () => {
      const animateElements = document.querySelectorAll(".benefit-card, .eligibility-section, .cta-section")

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("animate-fadeIn")
              observer.unobserve(entry.target)
            }
          })
        },
        {
          threshold: 0.1,
        },
      )

      animateElements.forEach((el) => {
        observer.observe(el)
      })
    }

    // Use a safer approach with setTimeout to ensure DOM is ready
    const timer = setTimeout(() => {
      initPostInteractions()
      initAnimations()
    }, 1000)

    // Clean up event listeners and timers on unmount
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timer)

      // Remove like button event listener
      if (likeButtonRef.current) {
        likeButtonRef.current.replaceWith(likeButtonRef.current.cloneNode(true))
      }
    }
  }, [])

  // Função para navegar para a página de login do Gov.br
  const handleCTAClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Redirecionando para a página de login do Gov.br em /app
    router.push("/login")
  }

  // Função aprimorada para controlar o acordeão
  const toggleAccordion = (index: number) => {
    // Se clicar no mesmo item que já está aberto, fecha-o
    if (activeAccordion === index) {
      setActiveAccordion(null)
    } else {
      // Caso contrário, abre o novo item
      setActiveAccordion(index)

      // Scroll suave para o item aberto após um pequeno delay para permitir a animação
      setTimeout(() => {
        const element = document.getElementById(`accordion-content-${index}`)
        if (element) {
          const headerHeight = 80 // Altura aproximada do cabeçalho fixo
          const rect = element.getBoundingClientRect()
          const isVisible =
            rect.top >= headerHeight && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)

          if (!isVisible) {
            const accordionItem = element.closest(".accordion-item")
            if (accordionItem) {
              accordionItem.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          }
        }
      }, 100)
    }
  }

  return (
    <div className="landing-page">
      {/* Instagram Embed Script - Carregado de forma segura com Next.js Script */}
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={() => {
          // Tenta processar o embed quando o script carregar
          if (window.instgrm) {
            window.instgrm.Embeds.process()
          }
        }}
      />

      <header className={`gov-header ${isScrolled ? "shadow-lg" : ""}`}>
        <div className="container">
          <div className="header-content">
            <img
              src="https://www.gov.br/++theme++padrao_govbr/img/govbr-colorido-b.png"
              alt="Logo Gov.br"
              className="gov-logo"
              style={{ maxHeight: "32px", width: "auto" }}
            />
            <nav className="header-nav">
              <ul>
                <li>
                  <a href="#">Serviços</a>
                </li>
                <li>
                  <a href="#">Órgãos</a>
                </li>
                <li>
                  <a href="#">Acesso à Informação</a>
                </li>
              </ul>
            </nav>
            <div className="header-actions"></div>
          </div>
        </div>
      </header>

      <main id="site-body">
        <section className="hero-section">
          <div className="container">
            <div className="announcement-section">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Brazilian_Government%27s_logo_%28Luiz_In%C3%A1cio_Lula_da_Silva_-_2023%29.svg/1200px-Brazilian_Government%27s_logo_%28Luiz_In%C3%A1cio_Lula_da_Silva_-_2023%29.svg.png"
                alt="Logo Governo Federal"
                className="top-logo"
                style={{ maxWidth: "150px", height: "auto" }}
              />
              <div className="announcement-tag">Governo Federal Anuncia</div>
            </div>
            <h1 className="main-headline">Decreto Presidencial Zera Conta de Luz para Milhões de Brasileiros</h1>
            <p className="main-subheadline">
              Medida assinada pelo presidente amplia a Tarifa Social. Veja o anúncio oficial:
            </p>
          </div>
        </section>

        <section className="content-section">
          <div className="container">
            <div className="instagram-post">
              <div id="video-container-wrapper" className="post-video-wrapper">
                {/* Restaurando o iframe do Instagram com atributos corretos */}
                <blockquote
                  className="instagram-media"
                  data-instgrm-captioned
                  data-instgrm-permalink="https://www.instagram.com/reel/DKw_UiFRWwD/"
                  data-instgrm-version="14"
                  style={{
                    background: "#FFF",
                    border: "0",
                    borderRadius: "3px",
                    boxShadow: "0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)",
                    margin: "1px",
                    maxWidth: "540px",
                    minWidth: "326px",
                    padding: "0",
                    width: "99.375%",
                  }}
                >
                  <div style={{ padding: "16px" }}>
                    <a
                      href="https://www.instagram.com/reel/DKw_UiFRWwD/"
                      style={{
                        background: "#FFFFFF",
                        lineHeight: "0",
                        padding: "0 0",
                        textAlign: "center",
                        textDecoration: "none",
                        width: "100%",
                      }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <div
                          style={{
                            backgroundColor: "#F4F4F4",
                            borderRadius: "50%",
                            flexGrow: "0",
                            height: "40px",
                            marginRight: "14px",
                            width: "40px",
                          }}
                        ></div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            flexGrow: "1",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "#F4F4F4",
                              borderRadius: "4px",
                              flexGrow: "0",
                              height: "14px",
                              marginBottom: "6px",
                              width: "100px",
                            }}
                          ></div>
                          <div
                            style={{
                              backgroundColor: "#F4F4F4",
                              borderRadius: "4px",
                              flexGrow: "0",
                              height: "14px",
                              width: "60px",
                            }}
                          ></div>
                        </div>
                      </div>
                      <div style={{ padding: "19% 0" }}></div>
                      <div
                        style={{
                          display: "block",
                          height: "50px",
                          margin: "0 auto 12px",
                          width: "50px",
                        }}
                      >
                        <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1">
                          <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                              <g>
                                <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                              </g>
                            </g>
                          </g>
                        </svg>
                      </div>
                      <div style={{ paddingTop: "8px" }}>
                        <div
                          style={{
                            color: "#3897f0",
                            fontFamily: "Arial,sans-serif",
                            fontSize: "14px",
                            fontStyle: "normal",
                            fontWeight: "550",
                            lineHeight: "18px",
                          }}
                        >
                          Ver esta publicação no Instagram
                        </div>
                      </div>
                      <div style={{ padding: "12.5% 0" }}></div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          marginBottom: "14px",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              backgroundColor: "#F4F4F4",
                              borderRadius: "50%",
                              height: "12.5px",
                              width: "12.5px",
                              transform: "translateX(0px) translateY(7px)",
                            }}
                          ></div>
                          <div
                            style={{
                              backgroundColor: "#F4F4F4",
                              height: "12.5px",
                              transform: "rotate(-45deg) translateX(3px) translateY(1px)",
                              width: "12.5px",
                              flexGrow: "0",
                              marginRight: "14px",
                              marginLeft: "2px",
                            }}
                          ></div>
                          <div
                            style={{
                              backgroundColor: "#F4F4F4",
                              borderRadius: "50%",
                              height: "12.5px",
                              width: "12.5px",
                              transform: "translateX(9px) translateY(-18px)",
                            }}
                          ></div>
                        </div>
                        <div style={{ marginLeft: "8px" }}>
                          <div
                            style={{
                              backgroundColor: "#F4F4F4",
                              borderRadius: "50%",
                              flexGrow: "0",
                              height: "20px",
                              width: "20px",
                            }}
                          ></div>
                          <div
                            style={{
                              width: "0",
                              height: "0",
                              borderTop: "2px solid transparent",
                              borderLeft: "6px solid #f4f4f4",
                              borderBottom: "2px solid transparent",
                              transform: "translateX(16px) translateY(-4px) rotate(30deg)",
                            }}
                          ></div>
                        </div>
                        <div style={{ marginLeft: "auto" }}>
                          <div
                            style={{
                              width: "0px",
                              borderTop: "8px solid #F4F4F4",
                              borderRight: "8px solid transparent",
                              transform: "translateY(16px)",
                            }}
                          ></div>
                          <div
                            style={{
                              backgroundColor: "#F4F4F4",
                              flexGrow: "0",
                              height: "12px",
                              width: "16px",
                              transform: "translateY(-4px)",
                            }}
                          ></div>
                          <div
                            style={{
                              width: "0",
                              height: "0",
                              borderTop: "8px solid #F4F4F4",
                              borderLeft: "8px solid transparent",
                              transform: "translateY(-4px) translateX(8px)",
                            }}
                          ></div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          flexGrow: "1",
                          justifyContent: "center",
                          marginBottom: "24px",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#F4F4F4",
                            borderRadius: "4px",
                            flexGrow: "0",
                            height: "14px",
                            marginBottom: "6px",
                            width: "224px",
                          }}
                        ></div>
                        <div
                          style={{
                            backgroundColor: "#F4F4F4",
                            borderRadius: "4px",
                            flexGrow: "0",
                            height: "14px",
                            width: "144px",
                          }}
                        ></div>
                      </div>
                    </a>
                    <p
                      style={{
                        color: "#c9c8cd",
                        fontFamily: "Arial,sans-serif",
                        fontSize: "14px",
                        lineHeight: "17px",
                        marginBottom: "0",
                        marginTop: "8px",
                        overflow: "hidden",
                        padding: "8px 0 7px",
                        textAlign: "center",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <a
                        href="https://www.instagram.com/reel/DKw_UiFRWwD/"
                        style={{
                          color: "#c9c8cd",
                          fontFamily: "Arial,sans-serif",
                          fontSize: "14px",
                          fontStyle: "normal",
                          fontWeight: "normal",
                          lineHeight: "17px",
                          textDecoration: "none",
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Uma publicação partilhada por Gov.br (@govbr)
                      </a>
                    </p>
                  </div>
                </blockquote>
              </div>
            </div>

            {/* Layout de duas colunas para benefícios e elegibilidade */}
            <div className="content-layout">
              <div className="benefits-section">
                <h2 className="section-title centered">Benefícios do Programa</h2>
                <div className="benefits-grid">
                  <div className="benefit-card">
                    <div className="benefit-icon">⚡</div>
                    <h3>Conta Zero</h3>
                    <p>Isenção total da conta de luz para consumo de até 80 kWh/mês</p>
                  </div>
                  <div className="benefit-card">
                    <div className="benefit-icon">👨‍👩‍👧‍👦</div>
                    <h3>Ampla Cobertura</h3>
                    <p>60 milhões de brasileiros beneficiados em todo o país</p>
                  </div>
                  <div className="benefit-card">
                    <div className="benefit-icon">📝</div>
                    <h3>Cadastro Simples</h3>
                    <p>Processo simplificado usando dados do CadÚnico</p>
                  </div>
                  <div className="benefit-card">
                    <div className="benefit-icon">🏠</div>
                    <h3>Economia Familiar</h3>
                    <p>Economia média de R$ 100 por mês no orçamento familiar</p>
                  </div>
                </div>
              </div>

              <div className="eligibility-section">
                <h2 className="section-title">Quem tem direito?</h2>
                <ul className="eligibility-list">
                  <li>Idosos com 65 anos ou mais que recebem Benefício de Prestação Continuada (BPC)</li>
                  <li>Famílias com pessoas que recebem o BPC</li>
                  <li>Famílias inscritas no CadÚnico</li>
                  <li>Beneficiários do Bolsa Família</li>
                  <li>Beneficiários do Auxílio Brasil</li>
                  <li>Famílias indígenas e quilombolas</li>
                  <li>Pessoas com deficiência</li>
                  <li>Famílias monoparentais (mães ou pais solteiros)</li>
                  <li>Idosos aposentados pelo INSS</li>
                  <li>Trabalhadores rurais</li>
                  <li>Pescadores artesanais</li>
                  <li>Agricultores familiares</li>
                  <li>Microempreendedores Individuais (MEI)</li>
                  <li>Trabalhadores informais</li>
                  <li>Desempregados cadastrados no Sine</li>
                  <li>Estudantes de escolas públicas</li>
                  <li>Famílias com crianças de 0 a 6 anos</li>
                  <li>Gestantes e lactantes</li>
                  <li>Portadores de doenças crônicas</li>
                  <li>Veteranos das Forças Armadas</li>
                  <li>Profissionais da saúde e educação</li>
                  <li>Trabalhadores domésticos</li>
                  <li>Motoristas de aplicativo</li>
                  <li>Comerciantes de pequeno porte</li>
                  <li>Artesãos e trabalhadores da economia criativa</li>
                  <li>Famílias em situação de vulnerabilidade social</li>
                  <li>Moradores de áreas rurais e periféricas</li>
                  <li>Beneficiários de programas habitacionais</li>
                  <li>Trabalhadores da construção civil</li>
                  <li>Prestadores de serviços autônomos</li>
                </ul>
              </div>
            </div>

            <div className="cta-section">
              {/* Usando onClick para garantir a navegação para a página de login do Gov.br */}
              <button onClick={handleCTAClick} className="cta-button animate-pulse">
                QUERO SABER SE TENHO DIREITO
              </button>
              <p className="cta-note">Verifique sua elegibilidade em menos de 2 minutos</p>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="container">
            <h2 className="section-title centered">Perguntas Frequentes</h2>
            <div className="accordion">
              {/* Implementação aprimorada do acordeão usando React state */}
              <div className={`accordion-item ${activeAccordion === 0 ? "active" : ""}`}>
                <button
                  className="accordion-header"
                  onClick={() => toggleAccordion(0)}
                  aria-expanded={activeAccordion === 0}
                  aria-controls="accordion-content-0"
                >
                  Como sei se tenho direito ao benefício?
                  <span className="material-icons">expand_more</span>
                </button>
                <div
                  className="accordion-content"
                  id="accordion-content-0"
                  role="region"
                  aria-labelledby="accordion-header-0"
                >
                  <p>
                    Para ter direito ao benefício, você precisa ter algum membro da família que receba o Benefício de
                    Prestação Continuada (BPC) ou ser idoso com 65 anos ou mais que recebe o BPC.
                  </p>
                </div>
              </div>
              <div className={`accordion-item ${activeAccordion === 1 ? "active" : ""}`}>
                <button
                  className="accordion-header"
                  onClick={() => toggleAccordion(1)}
                  aria-expanded={activeAccordion === 1}
                  aria-controls="accordion-content-1"
                >
                  Preciso me cadastrar para receber o benefício?
                  <span className="material-icons">expand_more</span>
                </button>
                <div
                  className="accordion-content"
                  id="accordion-content-1"
                  role="region"
                  aria-labelledby="accordion-header-1"
                >
                  <p>
                    Sim, é necessário fazer o cadastro através do portal gov.br ou em um posto de atendimento mais
                    próximo da sua residência. O processo é simples e rápido, bastando apresentar seus documentos
                    pessoais.
                  </p>
                </div>
              </div>
              <div className={`accordion-item ${activeAccordion === 2 ? "active" : ""}`}>
                <button
                  className="accordion-header"
                  onClick={() => toggleAccordion(2)}
                  aria-expanded={activeAccordion === 2}
                  aria-controls="accordion-content-2"
                >
                  O que acontece se eu consumir mais de 80 kWh por mês?
                  <span className="material-icons">expand_more</span>
                </button>
                <div
                  className="accordion-content"
                  id="accordion-content-2"
                  role="region"
                  aria-labelledby="accordion-header-2"
                >
                  <p>
                    Se o consumo ultrapassar 80 kWh por mês, você pagará apenas pelo consumo excedente, com desconto na
                    tarifa conforme as regras da Tarifa Social de Energia Elétrica. O benefício continua válido para os
                    primeiros 80 kWh.
                  </p>
                </div>
              </div>
              <div className={`accordion-item ${activeAccordion === 3 ? "active" : ""}`}>
                <button
                  className="accordion-header"
                  onClick={() => toggleAccordion(3)}
                  aria-expanded={activeAccordion === 3}
                  aria-controls="accordion-content-3"
                >
                  Quando o benefício começa a valer?
                  <span className="material-icons">expand_more</span>
                </button>
                <div
                  className="accordion-content"
                  id="accordion-content-3"
                  role="region"
                  aria-labelledby="accordion-header-3"
                >
                  <p>
                    O benefício começa a valer a partir do mês seguinte à aprovação do seu cadastro no programa. Você
                    receberá uma notificação confirmando a data de início do benefício.
                  </p>
                </div>
              </div>
              <div className={`accordion-item ${activeAccordion === 4 ? "active" : ""}`}>
                <button
                  className="accordion-header"
                  onClick={() => toggleAccordion(4)}
                  aria-expanded={activeAccordion === 4}
                  aria-controls="accordion-content-4"
                >
                  Como faço para verificar se estou recebendo o desconto?
                  <span className="material-icons">expand_more</span>
                </button>
                <div
                  className="accordion-content"
                  id="accordion-content-4"
                  role="region"
                  aria-labelledby="accordion-header-4"
                >
                  <p>
                    O desconto aparecerá automaticamente na sua conta de luz como "Tarifa Social" ou "Programa Luz do
                    Povo". Você também pode consultar o status do seu benefício diretamente no portal gov.br ou pelo
                    telefone da sua distribuidora de energia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="gov-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <img
                src="https://www.gov.br/++theme++padrao_govbr/img/govbr-colorido-b.png"
                alt="Logo Gov.br"
                className="gov-logo"
                style={{ maxHeight: "32px", width: "auto" }}
              />
              <p style={{ marginTop: "15px", opacity: "0.8" }}>Portal oficial do Governo Federal Brasileiro</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h3>Governo Federal</h3>
                <ul>
                  <li>
                    <a href="#">Órgãos do Governo</a>
                  </li>
                  <li>
                    <a href="#">Acesso à Informação</a>
                  </li>
                  <li>
                    <a href="#">Legislação</a>
                  </li>
                </ul>
              </div>
              <div className="footer-column">
                <h3>Canais de Atendimento</h3>
                <ul>
                  <li>
                    <a href="#">Fale com o Governo</a>
                  </li>
                  <li>
                    <a href="#">Ouvidoria</a>
                  </li>
                  <li>
                    <a href="#">Fale Conosco</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Governo Federal do Brasil. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
