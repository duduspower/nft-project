import { InvalidAddressError } from 'web3'

export class AddressValidator {
  static validateWalletAddress(address: string) {
    if (!address.match(/^0x[a-fA-F0-9]{40}$/g))
      throw new InvalidAddressError(`Given string : ${address} is not wallet address`);
  }

  static validateTransactionHash(hash: string) {
    if (!hash.match(/^0x([A-Fa-f0-9]{64})$/))
      throw new InvalidAddressError(`Given string : ${hash} is not wallet address`);
  }
}
