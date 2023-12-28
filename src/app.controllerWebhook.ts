import { Controller, Param, Post } from "@nestjs/common";
import { TransactionService } from "./app.transactionService";
import { HttpService } from "@nestjs/axios";

@Controller()
export class WebhookController{
    constructor(private readonly transactionService: TransactionService,private readonly httpService: HttpService) {}

    @Post("/listen/:observedAddress")
    async listen (@Param("observedAddress") observedAddress:string){
    this.transactionService.listenTransactions(observedAddress);
    }
}
