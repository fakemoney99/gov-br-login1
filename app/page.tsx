"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Esta página apenas redireciona para a landing page
export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push("/landing")
  }, [router])

  return null
}
