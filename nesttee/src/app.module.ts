import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IntentModule } from './intent/intent.module';
import { ContractModule } from './contract/contract.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    IntentModule,
    ContractModule,
  ],
})
export class AppModule {} 