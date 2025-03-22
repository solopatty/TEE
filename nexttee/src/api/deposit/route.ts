import { NextRequest, NextResponse } from "next/server"
import { applyDepositsFromChain } from "@/lib/teeEngine"

export async function POST(req: NextRequest) {
  await applyDepositsFromChain()
  return NextResponse.json({ status: "deposits updated from chain" })
}
