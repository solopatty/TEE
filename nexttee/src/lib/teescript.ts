import crypto from "crypto"
import { MerkleTree } from "merkletreejs"
import keccak256 from "keccak256"
import BigNumber from "bignumber.js"
import { ethers } from "ethers"

const balances: Record<string, Record<string, number>> = {}
let currentTree: MerkleTree | null = null
let root: string | null = null
let leaves: Buffer[] = []

// Apply deposit events from smart contract
export function applyDeposits(
  depositEvents: { user: string; token: string; amount: number }[]
) {
  for (const { user, token, amount } of depositEvents) {
    if (!balances[user]) balances[user] = {}
    balances[user][token] = (balances[user][token] || 0) + Number(amount)
  }
}

// Decrypt user intent (replace with secure enclave decryption)
export function decryptIntent(encryptedIntent: string) {
  // In production, decrypt using TEE private key
  return JSON.parse(encryptedIntent)
}

// Process encrypted intents → match → update balances
export function processEncryptedIntents(encryptedIntents: string[]) {
  const intents = encryptedIntents.map(decryptIntent)
  return matchIntents(intents)
}

// Match Coincidence of Wants
export function matchIntents(intents: any[]) {
  const matches: any[] = []
  const unmatched = [...intents]

  for (let i = 0; i < unmatched.length; i++) {
    for (let j = i + 1; j < unmatched.length; j++) {
      const a = unmatched[i]
      const b = unmatched[j]

      if (
        a.sellToken === b.buyToken &&
        a.buyToken === b.sellToken &&
        isRatioCompatible(a, b)
      ) {
        matches.push([a, b])
        updateBalances(a, b)
        unmatched.splice(j, 1)
        unmatched.splice(i, 1)
        i--
        break
      }
    }
  }

  return { matches, unmatched }
}

// Check if exchange ratios are compatible (within 0.01% slippage)
function isRatioCompatible(a: any, b: any) {
  const ratioA = new BigNumber(a.sellAmount).div(a.minBuyAmount)
  const ratioB = new BigNumber(b.minBuyAmount).div(b.sellAmount)
  return ratioA.minus(ratioB).abs().lt("0.0001")
}

// Update balance after a successful CoW match
function updateBalances(a: any, b: any) {
  if (!balances[a.user]) balances[a.user] = {}
  if (!balances[b.user]) balances[b.user] = {}

  balances[a.user][a.buyToken] =
    (balances[a.user][a.buyToken] || 0) + Number(a.minBuyAmount)
  balances[b.user][b.buyToken] =
    (balances[b.user][b.buyToken] || 0) + Number(b.minBuyAmount)
}

// Build Merkle tree from current balances
export function buildMerkleTree() {
  leaves = []

  for (const user of Object.keys(balances)) {
    for (const token of Object.keys(balances[user])) {
      const amount = balances[user][token]
      const leaf = keccak256(
        Buffer.from(
          `${user.toLowerCase()}${token.toLowerCase()}${amount.toString()}`
        )
      )
      leaves.push(leaf)
    }
  }

  currentTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
  root = currentTree.getHexRoot()
  return root
}

// Generate a Merkle proof for a user/token
export function generateMerkleProof(user: string, token: string) {
  const amount = balances[user]?.[token]
  if (!amount) throw new Error("No balance")

  const leaf = keccak256(
    Buffer.from(
      `${user.toLowerCase()}${token.toLowerCase()}${amount.toString()}`
    )
  )
  const proof = currentTree!.getHexProof(leaf)

  return { leaf: leaf.toString("hex"), proof, amount }
}

// Sign Merkle root with fake key (placeholder)
export function signMerkleRoot(root: string) {
  const fakePrivateKey = "aabbccddeeff00112233445566778899"
  return crypto.createHmac("sha256", fakePrivateKey).update(root).digest("hex")
}

// Build Merkle root, sign, return state
export function exportNewState() {
  const newRoot = buildMerkleTree()
  const signature = signMerkleRoot(newRoot)
  return { newRoot, signature }
}

// Post Merkle root on-chain (example call)
export async function postMerkleRoot(newRoot: string, signature: string) {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!)
  const wallet = new ethers.Wallet(process.env.TEE_PRIVATE_KEY!, provider)
  const contract = new ethers.Contract(
    process.env.SOLO_PATTY_CONTRACT!,
    ["function updateMerkleRoot(bytes32, bytes) external"],
    wallet
  )

  const tx = await contract.updateMerkleRoot(newRoot, signature)
  await tx.wait()
  console.log("✅ Merkle root posted on-chain:", newRoot)
}
