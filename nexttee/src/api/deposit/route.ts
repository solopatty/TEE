import { NextRequest, NextResponse } from "next/server"
import { applyDeposits } from "@/lib/teescript"

interface Deposit {
  user: string
  token: string
  amount: number
}

export async function POST(req: NextRequest) {
  const body: Deposit[] = await req.json()
  applyDeposits(body)
  return NextResponse.json({ status: "ok" })
}
