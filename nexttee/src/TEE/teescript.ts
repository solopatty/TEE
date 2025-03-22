import crypto from "crypto"
import { MerkleTree } from "merkletreejs"
import keccak256 from "keccak256"
import BigNumber from "bignumber.js"

let balances = {} // balances[user][token] = amount
let currentTree = null
let root = null
let leaves = []

// Apply deposit events
export function applyDeposits(depositEvents) {
  for (const { user, token, amount } of depositEvents) {
    if (!balances[user]) balances[user] = {}
    balances[user][token] = (balances[user][token] || 0) + Number(amount)
  }
}

// Decrypt intent (mocked — you’d use TEE inside enclave)
export function decryptIntent(encrypted) {
  const decrypted = JSON.parse(encrypted) // Replace with real decryption in TEE
  return decrypted
}

// Match CoW intents
export function matchIntents(intents) {
  const matches = []
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

// Update balances after matching
export function updateBalances(a, b) {
  if (!balances[a.user]) balances[a.user] = {}
  if (!balances[b.user]) balances[b.user] = {}

  balances[a.user][a.buyToken] =
    (balances[a.user][a.buyToken] || 0) + Number(a.minBuyAmount)
  balances[b.user][b.buyToken] =
    (balances[b.user][b.buyToken] || 0) + Number(b.minBuyAmount)
}

// Ratio comparison (to avoid floating point issues)
function isRatioCompatible(a, b) {
  const ratioA = new BigNumber(a.sellAmount).div(a.minBuyAmount)
  const ratioB = new BigNumber(b.minBuyAmount).div(b.sellAmount)
  return ratioA.minus(ratioB).abs().lt("0.0001")
}

//  Build Merkle tree from balances
export function buildMerkleTree() {
  leaves = []

  for (const user of Object.keys(balances)) {
    for (const token of Object.keys(balances[user])) {
      const amount = balances[user][token]
      const leaf = keccak256(
        Buffer.from(`${user.toLowerCase()}${token.toLowerCase()}${amount}`)
      )
      leaves.push(leaf)
    }
  }

  currentTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
  root = currentTree.getHexRoot()
  return root
}

//  Generate Merkle proof for a specific user/token
export function generateMerkleProof(user, token) {
  const amount = balances[user]?.[token]
  if (!amount) throw new Error("No balance")

  const leaf = keccak256(
    Buffer.from(`${user.toLowerCase()}${token.toLowerCase()}${amount}`)
  )
  const proof = currentTree.getHexProof(leaf)

  return { leaf: leaf.toString("hex"), proof, amount }
}

// Sign root (mock)
export function signMerkleRoot(root) {
  // Replace with actual TEE keypair signing
  const fakePrivateKey = "aabbccddeeff00112233445566778899"
  const signature = crypto
    .createHmac("sha256", fakePrivateKey)
    .update(root)
    .digest("hex")

  return signature
}

// Export state to post on-chain
export function exportNewState() {
  const newRoot = buildMerkleTree()
  const signature = signMerkleRoot(newRoot)
  return { newRoot, signature }
}
