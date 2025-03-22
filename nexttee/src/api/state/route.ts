import { NextResponse } from "next/server"
import { exportNewState } from "../../lib/teescript"

export async function GET() {
  const result = exportNewState()
  return NextResponse.json(result)
}
