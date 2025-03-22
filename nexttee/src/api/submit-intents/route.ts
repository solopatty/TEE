import { NextRequest, NextResponse } from "next/server"
import { processEncryptedIntents } from "@/lib/teescript"

export async function POST(req: NextRequest) {
  const encryptedIntents: string[] = await req.json()
  const result = processEncryptedIntents(encryptedIntents)
  return NextResponse.json(result)
}
