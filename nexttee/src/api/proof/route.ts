import { NextRequest, NextResponse } from "next/server"
import { generateMerkleProof } from "../../lib/teescript"

export async function POST(req: NextRequest) {
  const { user, token }: { user: string; token: string } = await req.json()

  try {
    const proof = generateMerkleProof(user, token)
    return NextResponse.json(proof)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
