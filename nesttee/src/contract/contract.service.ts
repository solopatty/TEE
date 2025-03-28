import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, http, createWalletClient } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { keccak256, encodePacked, hashMessage, hexToBigInt, hexToString, hexToNumber} from 'viem';

export interface Deposit {
  userAddress: string;
  token: string;
  amount: bigint;
  timestamp: number;
}

interface Balances {
  [userAddress: string]: {
    [token: string]: bigint;
  };
}

@Injectable()
export class ContractService implements OnModuleInit {
  private readonly logger = new Logger(ContractService.name);
  private client;
  private walletClient;
  private deposits: Deposit[] = [];
  private balances: Balances = {};
  private privateKey: string;

  constructor(private configService: ConfigService) {
    const rawPrivateKey = this.configService.get<string>('teePrivateKey');
    if (!rawPrivateKey) {
      throw new Error('TEE_PRIVATE_KEY environment variable is not set');
    }
    
    // Ensure private key is a valid hex string starting with 0x
    this.privateKey = rawPrivateKey.startsWith('0x') ? rawPrivateKey : `0x${rawPrivateKey}`;
    
    this.client = createPublicClient({
      chain: sepolia,
      transport: http(this.configService.get<string>('rpcUrl')),
    });
    
    const account = privateKeyToAccount(this.privateKey as `0x${string}`);
    this.walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(this.configService.get<string>('rpcUrl')),
    });
  }

  private async getEventTimestamp(blockNumber: bigint): Promise<number> {
    const block = await this.client.getBlock({ blockNumber });
    return Number(block.timestamp);
  }

  async onModuleInit() {
    this.logger.log('Initializing ContractService');
    await this.startDepositListener();
  }

  private async startDepositListener() {
    const contractAddress = this.configService.get<string>('soloPattyContract');
    this.logger.log(`Starting deposit listener for contract: ${contractAddress}`);
    
    this.client.watchContractEvent({
      address: contractAddress as `0x${string}`,
      abi: [{
        name: 'Deposited',
        type: 'event',
        inputs: [
          { type: 'address', name: 'user', indexed: true },
          { type: 'address', name: 'token', indexed: true },
          { type: 'uint256', name: 'amount' }
        ]
      }],
      eventName: 'Deposited',
      onLogs: async (logs) => {
        for (const log of logs) {
          const timestamp = await this.getEventTimestamp(log.blockNumber);
          const deposit: Deposit = {
            userAddress: `0x${log.topics[1].slice(26)}` as string,
            token: `0x${log.data.slice(26, 66)}` as string,
            amount: BigInt(hexToNumber(`0x${log.data.slice(66)}`)),
            timestamp: Math.floor(new Date(timestamp).getTime() / 1000)
          };
          this.deposits.push(deposit);
          // Update balances
          if (!this.balances[deposit.userAddress]) {
            this.balances[deposit.userAddress] = {};
          }
          if (!this.balances[deposit.userAddress][deposit.token]) {
            this.balances[deposit.userAddress][deposit.token] = 0n;
          }
          this.balances[deposit.userAddress][deposit.token] += deposit.amount;
          
          this.logger.log('New deposit processed', {
            user: deposit.userAddress,
            token: deposit.token,
            amount: deposit.amount.toString(),
            timestamp: timestamp
          });
        }
      },
    });
  }

  getDeposits(): Deposit[] {
    this.logger.debug(`Retrieved ${this.deposits.length} deposits`);
    return this.deposits;
  }

  getBalances(): Balances {
    this.logger.debug('Retrieved all balances');
    return this.balances;
  }

  getUserBalance(userAddress: string, token: string): bigint {
    const balance = this.balances[userAddress]?.[token] || 0n;
    this.logger.debug(`Retrieved balance for user ${userAddress}, token ${token}: ${balance.toString()}`);
    return balance;
  }

  updateBalance(userAddress: string, token: string, newBalance: bigint): void {
    if (!this.balances[userAddress]) {
      this.balances[userAddress] = {};
    }
    const oldBalance = this.balances[userAddress][token] || 0n;
    this.balances[userAddress][token] = newBalance;
    
    this.logger.debug(`Updated balance for user ${userAddress}, token ${token}`, {
      oldBalance: oldBalance.toString(),
      newBalance: newBalance.toString()
    });
  }

  async withdrawTokensWithSignature(userAddress: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      const amount = this.getUserBalance(userAddress, token);
      if (amount <= 0n) {
        this.logger.warn(`Withdrawal attempted with insufficient balance`, {
          user: userAddress,
          token,
          balance: amount.toString()
        });
        return { success: false, message: 'Insufficient balance' };
      }
  
      this.logger.log(`Processing withdrawal for user ${userAddress}`, {
        token,
        amount: amount.toString()
      });
  
      // ✅ Step 1: Create message hash
      const messageHash = keccak256(
        encodePacked(
          ['address', 'address', 'uint256'],
          [userAddress as `0x${string}`, token as `0x${string}`, amount]
        )
      );
  
      // ✅ Step 2: Convert to Ethereum Signed Message Hash
      const ethSignedMessageHash = hashMessage(messageHash);
  
      // ✅ Step 3: Sign the message
      const signature = await this.walletClient.signMessage({ message: { raw: ethSignedMessageHash } });
  
      // ✅ Step 4: Prepare contract call
      const contractAddress = this.configService.get<string>('soloPattyContract') as `0x${string}`;
  
      const { request } = await this.client.simulateContract({
        address: contractAddress,
        abi: [{
          name: 'withdrawTokensWithSignature',
          type: 'function',
          inputs: [
            { type: 'address', name: 'user' },
            { type: 'address', name: 'token' },
            { type: 'uint256', name: 'amount' },
            { type: 'bytes', name: 'signature' }
          ],
          outputs: [{ type: 'bool' }],
          stateMutability: 'nonpayable'
        }],
        functionName: 'withdrawTokensWithSignature',
        args: [userAddress as `0x${string}`, token as `0x${string}`, amount, signature]
      });
  
      // ✅ Step 5: Send transaction
      const hash = await this.walletClient.writeContract(request);
  
      // ✅ Step 6: Deduct only the withdrawn amount (not reset to 0)
      this.updateBalance(userAddress, token, amount - amount);
  
      this.logger.log(`Withdrawal successful`, {
        user: userAddress,
        token,
        amount: amount.toString(),
        transactionHash: hash
      });
  
      return {
        success: true,
        message: `Withdrawal successful. Transaction hash: ${hash}`
      };
    } catch (error) {
      this.logger.error(`Withdrawal failed`, {
        error: error.message,
        user: userAddress,
        token
      });
      return {
        success: false,
        message: `Withdrawal failed: ${error.message}`
      };
    }
  }
} 