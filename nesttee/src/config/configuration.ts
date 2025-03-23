const configuration = () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  rpcUrl: process.env.RPC_URL,
  soloPattyContract: process.env.SOLO_PATTY_CONTRACT,
  teePrivateKey: process.env.TEE_PRIVATE_KEY,
});

export default configuration; 