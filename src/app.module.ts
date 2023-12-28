import { Module } from '@nestjs/common';
import { TransactionService } from './app.transactionService';
import { HttpModule } from '@nestjs/axios';
import { WebhookController } from './app.controllerWebhook';

@Module({
  imports: [HttpModule],
  controllers: [WebhookController],
  providers: [TransactionService],
})
export class AppModule {}
