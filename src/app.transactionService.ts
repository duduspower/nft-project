import { TransactionData } from './app.transactionData';
import { Transaction } from './app.transaction';
import { Web3 } from "web3"
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AddressValidator } from './app.addressValidator';

@Injectable()
export class TransactionService {
  constructor(private readonly httpService: HttpService) {}

  web3 = new Web3(
    new Web3.providers.WebsocketProvider(
      'wss://polygon-mumbai.g.alchemy.com/v2/MA3xOeLHGBEOPX0i2kVaqnMs5phMsJvX',
    ),
  ); // todo env variable

  getTransactionType(transfer: any, address) {
    if (transfer.from.toLowerCase() === address.toLowerCase())
      return 'Withdraw';
    if (transfer.to.toLowerCase() === address.toLowerCase()) return 'Deposit';
    throw new InternalServerErrorException(
      'Internal Error : web3.eth.subscribe catched event not linked to given address : ' +
        address,
    );
  }

  async getTokenType() {
    const abiFunctions = TransactionData.getAbi().filter(
      (item) => item.type.toLowerCase() === 'function'.toLowerCase(),
    );
    const abiEvents = TransactionData.getAbi().filter(
      (item) => item.type.toLowerCase() === 'event'.toLowerCase(),
    );

    const hasTransfer = abiFunctions.some(
      (fn) => fn.name.toLowerCase() === 'transferFrom'.toLowerCase(),
    ); //ERC 721 specyfic functions
    const hasTransferEvent = abiEvents.some(
      (ev) => ev.name.toLowerCase() === 'transfer'.toLowerCase(),
    );

    const hasTransferBatch = abiFunctions.some(
      (fn) => fn.name.toLowerCase() === 'safeTransferFromBatch'.toLowerCase(),
    ); //ERC 1155 specyfic functions
    const hasTransferBatchEvent = abiEvents.some(
      (ev) => ev.name.toLowerCase() === 'transferBatch'.toLowerCase(),
    );

    if (hasTransfer && hasTransferEvent) {
      return 'ERC-721';
    } else if (hasTransferBatch && hasTransferBatchEvent) {
      return 'ERC-1155'; // todo test 1155 token transfer!!!
    } else {
      return 'Unknown Token Type';
    }
  }

  async getFromAndTo(transaction: any) {
    const decoded = this.web3.eth.abi.decodeParameters(
      TransactionData.getAbi()[15].inputs,
      transaction.input.slice(10),
    );
    const transfer = {
      from: decoded.from as string,
      to: decoded.to as string,
    };
    return transfer;
  }

  async getTokens(txHash:string) : Promise<{ contractAddr: string; index: string; }[]>{
    const data = await this.web3.eth.getTransactionReceipt(txHash);
    const logs = data.logs; //todo multiple tokens handling
    const index = this.web3.utils.hexToNumber(logs[0].topics[3].toString());
    const indexes = [];
    indexes[0] = { contractAddr: txHash, index: index}
    return indexes
  }

  async getTimestamp(blockNumber) {
    const block = await this.web3.eth.getBlock(blockNumber);
    return block.timestamp;
  }

  async createTransaction(output, observedAddress: string) {
    const tx = await this.web3.eth.getTransaction(output.transactionHash);
    const transfer = await this.getFromAndTo(tx);
    const transactionType = this.getTransactionType(transfer, observedAddress); //todo enum
    const timestamp = await this.getTimestamp(tx.blockNumber);
    const tokenType = await this.getTokenType(); //todo enum
    const transaction = new Transaction(
      tx.hash,
      transfer.from,
      transfer.to,
      transactionType,
      timestamp,
      await this.getTokens(tx.hash),tokenType
    );
    console.log("sended");
      this.httpService
        .post(
          'https://webhook-test.com/44783f329099ea6752d5bd91f0ae77f6',
          JSON.stringify(transaction, (_, v) => typeof v === 'bigint' ? v.toString() : v)
        )
        .subscribe({
          complete: () => {
            console.log('completed');
          },
          error: (err) => {
            console.log('Error occured while sending data to webhook : ' + err);
          },
        });
      //watch webhook at : https://webhook-test.com/payload/241c71c4-0128-4804-94ef-e69ea7dd7a36
    return transaction;
  }

  async listenTransactions(observedWallet: string) {
    AddressValidator.validateWalletAddress(observedWallet);
    console.log('Listening on transaction on address : ' + observedWallet);
    this.web3.eth
      .subscribe(
        'logs',
        { address: TransactionData.getContractAddress() },)
      .then((data) =>
        data.on('data', async (output) => {
          try {
            await this.createTransaction(output, observedWallet);
          } catch (err) {
            console.error(`Error in event callback: ${err}`);
          }
        }),
      );
  }
}
