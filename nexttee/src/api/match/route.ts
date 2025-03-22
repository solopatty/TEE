import { NextRequest, NextResponse } from "next/server"
import { matchIntents } from "../../lib/teescript"

interface PlainIntent {
  user: string
  sellToken: string
  buyToken: string
  sellAmount: number
  minBuyAmount: number
}

export async function POST(req: NextRequest) {
  const intents: PlainIntent[] = await req.json()
  const result = matchIntents(intents)
  return NextResponse.json(result)
}
