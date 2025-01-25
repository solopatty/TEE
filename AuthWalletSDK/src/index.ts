import { ethers } from "ethers"
import * as bip39 from "bip39"
import { payments } from "bitcoinjs-lib"
import { EthereumPublicKey, BitcoinPublicKey } from "./types"

// Hyperplane selection

const hyperplanes = ["blue", "yellow", "red", "green"]
const directions = ["up", "down", "right", "left"]

// Function to create an Ethereum wallet using Ethers.js
export function createNewEthereumWallet(): {
  publicKey: EthereumPublicKey
  privateKey: string
} {
  const wallet = ethers.Wallet.createRandom()

  const publicKey: EthereumPublicKey = {
    chain: "Ethereum",
    key: wallet.address, // The public key (address) derived from the private key
  }

  return { publicKey, privateKey: wallet.privateKey } // Return the private key if needed
}

// Function to create a new Ethereum wallet using BIP39
export async function createBIP39Wallet(): Promise<{
  mnemonic: string
  publicKey: string
  privateKey: string
}> {
  // Generate a BIP39 mnemonic
  const mnemonic = bip39.generateMnemonic() // Generates a random mnemonic

  // Convert the mnemonic to a seed
  const seed = await bip39.mnemonicToSeed(mnemonic)

  // Create a wallet from the seed
  const wallet = ethers.Wallet.fromMnemonic(mnemonic)

  // Get the public and private keys
  const publicKey = wallet.address // Public key (Ethereum address)
  const privateKey = wallet.privateKey // Private key

  return { mnemonic, publicKey, privateKey }
}

// Function to import an Ethereum wallet from a private key
export function importEthereumWallet(privateKey: string): {
  publicKey: EthereumPublicKey
} {
  const wallet = new ethers.Wallet(privateKey)

  const publicKey: EthereumPublicKey = {
    chain: "Ethereum",
    key: wallet.address, // The public key (address) derived from the private key
  }

  return { publicKey }
}

// Function to create a Bitcoin wallet
export function setupBitcoinWallet(privateKey: string) {
  // Create a key pair from the private key
  const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, "hex"))

  const publicKey: BitcoinPublicKey = {
    chain: "Bitcoin",
    key: keyPair.publicKey.toString("hex"), // Public key in hex format
  }

  return { publicKey }
}

// Fullman protocol
export default function () {}
