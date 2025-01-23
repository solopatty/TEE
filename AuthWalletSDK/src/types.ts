// Define a type for Bitcoin public key
export type BitcoinPublicKey = {
  chain: "Bitcoin"
  key: string // The actual public key as a string (in hex format)
}

// Define a type for Bitcoin address
export type BitcoinAddress = {
  chain: "Bitcoin"
  address: string // The actual Bitcoin address
}

// Define a type for Bitcoin public key
export type EthereumPublicKey = {
  chain: "Ethereum"
  key: string // The actual public key as a string (in hex format)
}

// Define a type for Bitcoin address
export type EthereumAddress = {
  chain: "Ethereum"
  address: string // The actual Bitcoin address
}
