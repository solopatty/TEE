// next.config.ts
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev"

async function setup() {
  if (process.env.NODE_ENV === "development") {
    await setupDevPlatform()
  }
}

setup().catch((error) => {
  console.error("Error setting up development platform:", error)
})

import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
}

export default nextConfig
