interface InstagramEmbeds {
  Embeds: {
    process: () => void
  }
}

declare global {
  interface Window {
    instgrm?: InstagramEmbeds
  }
}

export {}
