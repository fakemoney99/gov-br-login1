import { Check } from "lucide-react"

interface ChatMessageProps {
  text: string
  sender: "bot" | "user"
  timestamp?: string
}

export function ChatMessage({ text, sender, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex ${sender === "bot" ? "justify-start" : "justify-end"} mb-4`}>
      <div className={`message-bubble ${sender === "bot" ? "bot" : "user"} relative`}>
        {text.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-1" : ""}>
            {line}
          </p>
        ))}

        {sender === "user" && (
          <div className="absolute bottom-1 right-2 flex items-center text-xs text-gray-500">
            <span className="mr-1">{timestamp || "12:34"}</span>
            <div className="flex">
              <Check size={14} className="double-check" />
              <Check size={14} className="double-check -ml-2" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
