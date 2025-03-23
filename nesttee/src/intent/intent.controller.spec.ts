import { Test, TestingModule } from '@nestjs/testing';
import { IntentController } from './intent.controller';
import { IntentService } from './intent.service';
import { ContractService } from '../contract/contract.service';

describe('IntentController', () => {
  let controller: IntentController;

  const mockIntentService = {
    submitIntent: jest.fn(),
    getMatchNotifications: jest.fn(),
  };

  const mockContractService = {
    withdrawTokensWithSignature: jest.fn(),
  };

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      controllers: [IntentController],
      providers: [
        {
          provide: IntentService,
          useValue: mockIntentService,
        },
        {
          provide: ContractService,
          useValue: mockContractService,
        },
      ],
    }).compile();

    controller = testingModule.get<IntentController>(IntentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('submitIntent', () => {
    it('should submit an intent', async () => {
      const intent = {
        userAddress: '0x123',
        tokenFromAddress: '0xabc',
        tokenToAddress: '0xdef',
        amount: '100',
        receive: '200',
        expiryTime: Date.now() + 3600000,
      };

      const expectedResponse = {
        success: true,
        message: 'Intent submitted successfully',
      };

      mockIntentService.submitIntent.mockResolvedValue(expectedResponse);

      const result = await controller.submitIntent(intent);
      expect(result).toEqual(expectedResponse);
      expect(mockIntentService.submitIntent).toHaveBeenCalledWith(intent);
    });
  });

  describe('claimTokens', () => {
    it('should claim tokens successfully', async () => {
      const claimRequest = {
        userAddress: '0x123',
        token: '0xabc',
      };

      const expectedResponse = {
        success: true,
        message: 'Withdrawal successful',
      };

      mockContractService.withdrawTokensWithSignature.mockResolvedValue(expectedResponse);

      const result = await controller.claimTokens(claimRequest);
      expect(result).toEqual(expectedResponse);
      expect(mockContractService.withdrawTokensWithSignature).toHaveBeenCalledWith(
        claimRequest.userAddress,
        claimRequest.token,
      );
    });
  });

  describe('getMatchNotifications', () => {
    it('should return match notifications for a user', async () => {
      const userAddress = '0x123';
      const expectedNotifications = [
        {
          matchedIntents: {
            intent1: {
              userAddress: '0x123',
              tokenFromAddress: '0xabc',
              tokenToAddress: '0xdef',
              amount: '100',
              receive: '200',
              expiryTime: Date.now() + 3600000,
            },
            intent2: {
              userAddress: '0x456',
              tokenFromAddress: '0xdef',
              tokenToAddress: '0xabc',
              amount: '200',
              receive: '100',
              expiryTime: Date.now() + 3600000,
            },
          },
          transactionHash: '0x...',
          timestamp: Date.now(),
        },
      ];

      mockIntentService.getMatchNotifications.mockReturnValue(expectedNotifications);

      const result = await controller.getMatchNotifications(userAddress);
      expect(result).toEqual({
        success: true,
        notifications: expectedNotifications,
      });
      expect(mockIntentService.getMatchNotifications).toHaveBeenCalledWith(userAddress);
    });
  });
}); 