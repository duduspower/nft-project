export class TransactionValue{

    observedContractAddress:string;
    transactionHash:string;
    from:string;
    to:string;
    transactionType:string;
    timestamp:string;
    tokenIndex:string;
    tokenType:string;

    constructor(observedContractAddress, transactionHash, from, to, transactionType, timestamp, tokenIndex, tokenType){
        this.observedContractAddress = observedContractAddress;
        this.transactionHash = transactionHash;
        this.from = from;
        this.to = to;
        this.transactionType = transactionType;
        this.timestamp = timestamp;
        this.tokenIndex = tokenIndex;
        this.tokenType = tokenType
    }

    toString() :string{ // todo dopytać jak się powinno concatenować stringi w js
        const response = "Transaction : {\n  " + 
        "observedContractAddress : " + this.observedContractAddress + "\n  " + 
        "transactionHash : " + this.transactionHash + "\n  " +
        "from : " + this.from + "\n  " +
        "to : " + this.to + "\n  " +
        "transactionType : " + this.transactionType + "\n  " + 
        "timestamp : " + this.timestamp + "\n  " + // todo dopytać jaki ma być ten timestamp(czy to ma być data czy long)
        "tokenIndex : " + this.tokenIndex + "\n  " + 
        "tokenType : " + this.tokenType + "\n}";
        console.log(response);
        return response;
    }
}

module.exports = TransactionValue;