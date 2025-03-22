import crypto from "crypto"
import { MerkleTree } from "merkletreejs"
import keccak256 from "keccak256"
import BigNumber from "bignumber.js"
import { ethers } from "ethers"

type DepositEvent = {
  user: string
  token: string
  amount: number
}

const balances: Record<string, Record<string, number>> = {}
let currentTree: MerkleTree | null = null
let root: string | null = null
let leaves: Buffer[] = []

// Read deposit events directly from smart contract
export async function fetchDepositEvents(): Promise<DepositEvent[]> {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!)
  const contract = new ethers.Contract(
    process.env.SOLO_PATTY_CONTRACT!,
    [
      "event Deposited(address indexed user, address indexed token, uint256 amount)",
    ],
    provider
  )

  const events = await contract.queryFilter("Deposited", -10000) // Fetch last 10,000 blocks

  return events.map((e: any) => ({
    user: e.args.user,
    token: e.args.token,
    amount: Number(e.args.amount.toString()),
  }))
}

// Apply deposit events to balance map
export async function applyDepositsFromChain() {
  const depositEvents = await fetchDepositEvents()
  for (const { user, token, amount } of depositEvents) {
    if (!balances[user]) balances[user] = {}
    balances[user][token] = (balances[user][token] || 0) + amount
  }
}

export function decryptIntent(encryptedIntent: string) {
  return JSON.parse(encryptedIntent)
}

export function processEncryptedIntents(encryptedIntents: string[]) {
  const intents = encryptedIntents.map(decryptIntent)
  return matchIntents(intents)
}

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

function isRatioCompatible(a: any, b: any) {
  const ratioA = new BigNumber(a.sellAmount).div(a.minBuyAmount)
  const ratioB = new BigNumber(b.minBuyAmount).div(b.sellAmount)
  return ratioA.minus(ratioB).abs().lt("0.0001")
}

function updateBalances(a: any, b: any) {
  if (!balances[a.user]) balances[a.user] = {}
  if (!balances[b.user]) balances[b.user] = {}

  balances[a.user][a.buyToken] =
    (balances[a.user][a.buyToken] || 0) + Number(a.minBuyAmount)
  balances[b.user][b.buyToken] =
    (balances[b.user][b.buyToken] || 0) + Number(b.minBuyAmount)
}

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

export function signMerkleRoot(root: string) {
  const fakePrivateKey = "aabbccddeeff00112233445566778899"
  return crypto.createHmac("sha256", fakePrivateKey).update(root).digest("hex")
}

export function exportNewState() {
  const newRoot = buildMerkleTree()
  const signature = signMerkleRoot(newRoot)
  return { newRoot, signature }
}

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

export async function generateTEEWithdrawalSignature(
  user: string,
  token: string,
  amount: number
): Promise<string> {
  const leaf = ethers.utils.solidityKeccak256(
    ["address", "address", "uint256"],
    [user, token, amount]
  )

  const wallet = new ethers.Wallet(process.env.TEE_PRIVATE_KEY!)
  const signature = await wallet.signMessage(ethers.utils.arrayify(leaf))

  return signature
}
