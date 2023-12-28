const { Web3 } = require('web3');
const TransactionData = require("./app.transactionData");
const TransactionValue = require("./app.transactionValue");

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionService{
	constructor(private readonly httpService: HttpService) {}

web3 = new Web3(new Web3.providers.WebsocketProvider('wss://polygon-mumbai.g.alchemy.com/v2/MA3xOeLHGBEOPX0i2kVaqnMs5phMsJvX'));

getTransactionType(inputData, adress){
    const addressLength = 40;
	const withoutFront = String(inputData).substring(34, inputData.length);
	const firstAdress = withoutFront.substring(0, addressLength);
    const nextAdressStart = addressLength + 24;
	const secondAdress = withoutFront.substring(nextAdressStart, nextAdressStart + addressLength);
	const adressWithout0x = String(adress).substring(2);
    if(firstAdress.toLowerCase() === adressWithout0x.toLowerCase()) return "Withdraw";
    if(secondAdress.toLowerCase() === adressWithout0x.toLowerCase()) return "Deposit";
    return "Observed address not taking part in given transaction";
}

async getTokenType(tokenId, abi, contractAddress){
  const contract = new this.web3.eth.Contract(abi, contractAddress);
  const ownerOf = await contract.methods.ownerOf(tokenId).call();
  if(ownerOf) return "ERC-721";
  const balanceOf = await contract.methods.balanceOf(tokenId).call();
  if(balanceOf) return "ERC-1155";
  return "Unknown Token Type";
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
		const transactionType = this.getTransactionType(tx.data, observedAddress);
		const timestamp = await this.getTimestamp(tx.blockNumber);
		const tokenType = await this.getTokenType(tokenId, TransactionData.getAbi(), contractAddress);
		const transaction = new TransactionValue(contractAddress, tx.hash, tx.from, tx.to, transactionType, timestamp, tokenId, tokenType);
		const transactionString = transaction.toString();
		this.httpService
      	.post('https://webhook.site/d6c7a688-f861-423e-8cfd-1e184ad631c0', transactionString)
      	.subscribe({
        complete: () => {
          console.log('completed');
        },
        error: (err) => {
          console.log("Error occured : " + err)
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
		console.log("output z createTransaction : " + result);
		return result;
      		}
			catch (err) {
      console.error(`Error in event callback: ${err}`);
  	}
}));
}
}