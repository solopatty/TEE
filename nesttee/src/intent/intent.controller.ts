import { Controller, Post, Body, Get, Param, Logger } from '@nestjs/common';
import { IntentService, MatchResponse, MatchNotification } from './intent.service';
import { ContractService } from '../contract/contract.service';

export interface Intent {
  userAddress: string;
  tokenFromAddress: string;
  tokenToAddress: string;
  amount: string;
  receive: string;
  expiryTime: number;
  timestamp?: number;
}

interface MatchNotificationResponse {
  success: boolean;
  notifications: MatchNotification[];
}

@Controller('intent')
export class IntentController {
  private readonly logger = new Logger(IntentController.name);

  constructor(
    private readonly intentService: IntentService,
    private readonly contractService: ContractService,
  ) {}

  @Post('submit')
  async submitIntent(@Body() intent: Intent): Promise<MatchResponse> {
    this.logger.debug('Received intent submission');
    
    const result = await this.intentService.submitIntent(intent);
    
    this.logger.debug('Intent submission processed', {
      success: result.success,
      message: result.message,
      match: result.match
    });
    
    return result;
  }

  @Post('claim')
  async claimTokens(
    @Body() body: { userAddress: string; token: string }
  ) {
    this.logger.debug('Received token claim request', {
      user: body.userAddress,
      token: body.token
    });
    
    const result = await this.contractService.withdrawTokensWithSignature(
      body.userAddress,
      body.token
    );
    
    this.logger.debug('Token claim processed', {
      success: result.success,
      message: result.message
    });
    
    return result;
  }

  @Get('matches/:userAddress')
  async getMatchNotifications(@Param('userAddress') userAddress: string): Promise<MatchNotificationResponse> {
    this.logger.debug('Retrieving match notifications', { user: userAddress });
    
    const notifications = this.intentService.getMatchNotifications(userAddress);
    
    this.logger.debug('Retrieved match notifications', {
      user: userAddress,
      count: notifications.length
    });
    
    return {
      success: true,
      notifications
    };
  }
} 