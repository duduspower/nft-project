import { AddressValidator } from './app.addressValidator'
export class Transaction {
  hash!: string;
  from!: string;
  to!: string;
  type!: string;
  timestamp!: bigint;
  tokens!: { contractAddr: string; index: string } [];
  tokenType!:string

  constructor(hash:string, from:string, to:string, type:string, timestamp:bigint, tokens: { contractAddr: string; index: string } [], tokenType:string) {
    AddressValidator.validateTransactionHash(hash);
    AddressValidator.validateWalletAddress(from);
    AddressValidator.validateWalletAddress(to);
    this.hash = hash;
    this.from = from;
    this.to = to;
    this.type = type;
    this.timestamp = timestamp;
    this.tokens = tokens;
    this.tokenType = tokenType;
  }
}
