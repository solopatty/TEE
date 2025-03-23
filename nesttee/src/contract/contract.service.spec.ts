import { Test, TestingModule } from '@nestjs/testing';
import { ContractService } from './contract.service';
import { ConfigService } from '@nestjs/config';

// Mock viem functions
jest.mock('viem', () => ({
  createPublicClient: jest.fn(() => ({
    watchContractEvent: jest.fn(),
    simulateContract: jest.fn().mockResolvedValue({
      request: { mock: 'request' }
    })
  })),
  http: jest.fn(),
  createWalletClient: jest.fn(() => ({
    signMessage: jest.fn().mockResolvedValue('0xmocksignature'),
    writeContract: jest.fn().mockResolvedValue('0xmocktxhash')
  })),
  keccak256: jest.fn().mockReturnValue('0xmockhash'),
  encodePacked: jest.fn().mockReturnValue('0xmockencoded')
}));

jest.mock('viem/accounts', () => ({
  privateKeyToAccount: jest.fn(() => ({
    address: '0xmockaddress',
    signMessage: jest.fn()
  }))
}));

describe('ContractService', () => {
  let service: ContractService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        privateKey: '0x123',
        rpcUrl: 'https://sepolia.infura.io/v3/123',
        soloPattyContract: '0xabc',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        ContractService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = testingModule.get<ContractService>(ContractService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserBalance', () => {
    it('should return 0n for non-existent balance', () => {
      const balance = service.getUserBalance('0x123', '0xabc');
      expect(balance).toBe(0n);
    });

    it('should return correct balance for existing user and token', () => {
      // First update a balance
      service.updateBalance('0x123', '0xabc', 100n);
      
      // Then get it
      const balance = service.getUserBalance('0x123', '0xabc');
      expect(balance).toBe(100n);
    });
  });

  describe('updateBalance', () => {
    it('should update balance for existing user and token', () => {
      service.updateBalance('0x123', '0xabc', 100n);
      const balance = service.getUserBalance('0x123', '0xabc');
      expect(balance).toBe(100n);
    });

    it('should update balance for new user', () => {
      service.updateBalance('0x456', '0xabc', 200n);
      const balance = service.getUserBalance('0x456', '0xabc');
      expect(balance).toBe(200n);
    });

    it('should update balance for new token', () => {
      service.updateBalance('0x123', '0xdef', 300n);
      const balance = service.getUserBalance('0x123', '0xdef');
      expect(balance).toBe(300n);
    });
  });

  describe('getBalances', () => {
    it('should return empty object when no balances exist', () => {
      const balances = service.getBalances();
      expect(balances).toEqual({});
    });

    it('should return all balances', () => {
      // Set up some test balances
      service.updateBalance('0x123', '0xabc', 100n);
      service.updateBalance('0x123', '0xdef', 200n);
      service.updateBalance('0x456', '0xabc', 300n);

      const balances = service.getBalances();
      expect(balances).toEqual({
        '0x123': {
          '0xabc': 100n,
          '0xdef': 200n,
        },
        '0x456': {
          '0xabc': 300n,
        },
      });
    });
  });

  describe('withdrawTokensWithSignature', () => {
    it('should fail with insufficient balance', async () => {
      const result = await service.withdrawTokensWithSignature('0x123', '0xabc');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Insufficient balance');
    });

    it('should succeed with sufficient balance', async () => {
      // Set up sufficient balance
      service.updateBalance('0x123', '0xabc', 1000n);

      const result = await service.withdrawTokensWithSignature('0x123', '0xabc');
      expect(result.success).toBe(true);
      expect(result.message).toContain('Withdrawal successful');
      expect(result.message).toContain('Transaction hash');

      // Verify balance is updated to 0
      const balance = service.getUserBalance('0x123', '0xabc');
      expect(balance).toBe(0n);
    });
  });
}); 