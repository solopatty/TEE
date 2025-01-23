import { ethers } from "ethers"
import { payments } from "bitcoinjs-lib"
import { EthereumPublicKey, BitcoinPublicKey } from "./types"

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
