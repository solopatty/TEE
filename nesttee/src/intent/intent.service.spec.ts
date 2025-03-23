import { Test, TestingModule } from '@nestjs/testing';
import { IntentService } from './intent.service';
import { ContractService } from '../contract/contract.service';

describe('IntentService', () => {
  let service: IntentService;

  const mockContractService = {
    getUserBalance: jest.fn(),
    updateBalance: jest.fn(),
    getBalances: jest.fn(),
  };

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        IntentService,
        {
          provide: ContractService,
          useValue: mockContractService,
        },
      ],
    }).compile();

    service = testingModule.get<IntentService>(IntentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submitIntent', () => {
    it('should submit an intent successfully', async () => {
      const intent = {
        userAddress: '0x123',
        tokenFromAddress: '0xabc',
        tokenToAddress: '0xdef',
        amount: '100',
        receive: '200',
        expiryTime: Date.now() + 3600000, // 1 hour from now
      };

      const result = await service.submitIntent(intent);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Intent submitted successfully');
    });
  });

  describe('matchIntents', () => {
    it('should match two compatible intents', async () => {
      // Setup mock balances
      mockContractService.getUserBalance.mockImplementation(() => {
        return BigInt(1000); // Sufficient balance for all users
      });

      // Submit first intent
      const intent1 = {
        userAddress: '0x123',
        tokenFromAddress: '0xabc',
        tokenToAddress: '0xdef',
        amount: '100',
        receive: '200',
        expiryTime: Date.now() + 3600000,
      };

      // Submit second intent (matching)
      const intent2 = {
        userAddress: '0x456',
        tokenFromAddress: '0xdef',
        tokenToAddress: '0xabc',
        amount: '200',
        receive: '100',
        expiryTime: Date.now() + 3600000,
      };

      await service.submitIntent(intent1);
      await service.submitIntent(intent2);

      const result = await service.matchIntents();
      expect(result.success).toBe(true);
      expect(result.match).toBeDefined();
      
      // Verify intent1 matches except for timestamp
      const { timestamp: timestamp1, ...intent1WithoutTimestamp } = result.match.matchedIntents.intent1;
      expect(intent1WithoutTimestamp).toEqual(intent1);
      expect(typeof timestamp1).toBe('number');
      
      // Verify intent2 matches except for timestamp
      const { timestamp: timestamp2, ...intent2WithoutTimestamp } = result.match.matchedIntents.intent2;
      expect(intent2WithoutTimestamp).toEqual(intent2);
      expect(typeof timestamp2).toBe('number');
    });

    it('should not match intents with insufficient balance', async () => {
      // Setup mock balances
      mockContractService.getUserBalance.mockImplementation(() => {
        return BigInt(50); // Insufficient balance
      });

      const intent1 = {
        userAddress: '0x123',
        tokenFromAddress: '0xabc',
        tokenToAddress: '0xdef',
        amount: '100',
        receive: '200',
        expiryTime: Date.now() + 3600000,
      };

      const intent2 = {
        userAddress: '0x456',
        tokenFromAddress: '0xdef',
        tokenToAddress: '0xabc',
        amount: '200',
        receive: '100',
        expiryTime: Date.now() + 3600000,
      };

      await service.submitIntent(intent1);
      await service.submitIntent(intent2);

      const result = await service.matchIntents();
      expect(result).toBeNull();
    });
  });

  describe('getMatchNotifications', () => {
    it('should return notifications for a user', async () => {
      // Setup a match first
      mockContractService.getUserBalance.mockImplementation(() => BigInt(1000));
      
      const intent1 = {
        userAddress: '0x123',
        tokenFromAddress: '0xabc',
        tokenToAddress: '0xdef',
        amount: '100',
        receive: '200',
        expiryTime: Date.now() + 3600000,
      };

      const intent2 = {
        userAddress: '0x456',
        tokenFromAddress: '0xdef',
        tokenToAddress: '0xabc',
        amount: '200',
        receive: '100',
        expiryTime: Date.now() + 3600000,
      };

      await service.submitIntent(intent1);
      await service.submitIntent(intent2);
      await service.matchIntents();

      const notifications = service.getMatchNotifications('0x123');
      expect(notifications).toHaveLength(1);
      expect(notifications[0].matchedIntents.intent1.userAddress).toBe('0x123');
    });
  });
}); 