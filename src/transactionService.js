const { Web3 } = require('web3');

const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://sepolia.infura.io/ws/v3/a9611a26646741cea09b7ccd2b5c2696'));
var account = '0xa9196DedDF2523B6344F7CF0f2Cc301b7babb112';
web3.eth.getBalance("0xa9196DedDF2523B6344F7CF0f2Cc301b7babb112").then((data) => console.log(`Balance : ${data}`));
web3.eth.subscribe('logs' ,function(err, res) {
    console.log(res);
    console.log(err);
}).then((data) => data.on('data' , async (output) => {
  try{
  let tx = await web3.eth.getTransaction(output.transactionHash);
  console.log(`Transaction ${tx.from}`);
  if(account == tx.from.toLowerCase()){
    console.log(`Subscribed transaction info : ${{address: tx.from, value : web3.utils.fromWei(tx.value, 'ether')}}`);
  }
  }
  catch(err){
    console.log(`Error : ${err}`);
  }
}));