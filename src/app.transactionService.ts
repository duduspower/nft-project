const { Web3 } = require('web3');
const TransactionData = require("./app.transactionData");
const TransactionValue = require("./app.transactionValue");

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionService{
	constructor(private readonly httpService: HttpService) {}

web3 = new Web3(new Web3.providers.WebsocketProvider('wss://polygon-mumbai.g.alchemy.com/v2/MA3xOeLHGBEOPX0i2kVaqnMs5phMsJvX'));

getTransactionType(transfer:any, address){
    if(transfer.from.toLowerCase() === address.toLowerCase()) return "Withdraw";
    if(transfer.to.toLowerCase() === address.toLowerCase()) return "Deposit";
    return "Observed address not taking part in given transaction";
}

async getTokenType(tokenId,contractAddress){
  	const contract = new this.web3.eth.Contract(TransactionData.getAbi(), contractAddress);
  	const ownerOf = await contract.methods.ownerOf(tokenId).call();
  	if(ownerOf) return "ERC-721";
  	const balanceOf = await contract.methods.balanceOf(tokenId).call();
  	if(balanceOf) return "ERC-1155";
  	return "Unknown Token Type";
}

async getFromAndTo(transaction:any){
	const decoded = this.web3.eth.abi.decodeParameters(TransactionData.getAbi()[15].inputs, transaction.input.slice(10));
	const transfer = {
        from : decoded.from as string,
		to : decoded.to as string,
    };
	return transfer;
}

async getTokenId(txHash){
	const data = await this.web3.eth.getTransactionReceipt(txHash);
	const logs = data.logs;
	return this.web3.utils.hexToNumber(logs[0].topics[3]);
}

async getTimestamp(blockNumber){
	const block = await this.web3.eth.getBlock(blockNumber);
    return block.timestamp;
}

async createTransaction(output, contractAddress:string, observedAddress:string){
		const tx = await this.web3.eth.getTransaction(output.transactionHash);// token index to ma być to czy to ma być ten index tokena mumbai np?
		const tokenId = await this.getTokenId(tx.hash);
		const transfer = await this.getFromAndTo(tx);
		const transactionType = this.getTransactionType(transfer, observedAddress);
		const timestamp = await this.getTimestamp(tx.blockNumber);
		const tokenType = await this.getTokenType(tokenId, contractAddress);
		const transaction = new TransactionValue(contractAddress, tx.hash, transfer.from, transfer.to, transactionType, timestamp, tokenId, tokenType);
		const transactionString = transaction.toString();
		this.httpService
      	.post('https://webhook.site/d6c7a688-f861-423e-8cfd-1e184ad631c0', transactionString)
      	.subscribe({
        complete: () => {
          console.log('completed');
        },
        error: (err) => {
          console.log("Error occured while sending data to webhook : " + err)
        },
      	});
		return transaction;
}


async listenTransactions(observedWallet:string){
console.log('Listening to trasnactions on contractAddress : ' + TransactionData.getContractAddress());
this.web3.eth.subscribe('logs', {address:TransactionData.getContractAddress()}, function (err, res) {
  console.log(res);
  console.log(err);
}).then((data) => data.on('data', async (output) => {
	try {
		const result = this.createTransaction(output, TransactionData.getContractAddress(), observedWallet);
		return result;
      		}
			catch (err) {
      console.error(`Error in event callback: ${err}`);
  	}
}));
}
}