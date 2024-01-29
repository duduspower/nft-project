import { Module } from '@nestjs/common';
import { TransactionService } from './app.transactionService';
import { HttpModule } from '@nestjs/axios';
import { TestController } from './app.testController';

@Module({
  imports: [HttpModule],
  controllers: [TestController],
  providers: [TransactionService],
})
export class AppModule {}
