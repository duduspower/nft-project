import { Controller, Param, Post } from '@nestjs/common';
import { TransactionService } from './app.transactionService';

@Controller()
export class TestController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('/listen/:observedAddress')
  async listen(@Param('observedAddress') observedAddress: string) {
    this.transactionService.listenTransactions(observedAddress);
  }
}
