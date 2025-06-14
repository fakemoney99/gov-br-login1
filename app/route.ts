import { redirect } from "next/navigation"

export function GET() {
  // Redirecionando para a landing page
  redirect("/landing")
}
