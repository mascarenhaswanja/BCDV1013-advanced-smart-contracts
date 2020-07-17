// Inject environemnt variable in this file
require("dotenv").config("./env");

// Import Web3
const Web3 = require("web3");

// Import BigNumber
const BigNumber = require("bignumber.js");

// Import abi
const abi = require("./interact.json");

const { bytecode } = require("./bytecode.js");

// create web3 instance
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.URI));

// get the account object from private key
const accountObj = web3.eth.accounts.privateKeyToAccount(
  process.env.PRIVATE_KEY
);

const _number = new BigNumber(2);   // initial number of constructor in Interact.sol
const interactContract = new web3.eth.Contract(abi);

const contractData = interactContract
  .deploy({
    data: `0x${bytecode}`,
    arguments: [_number],
  })
  .encodeABI();
web3.eth
  .estimateGas({ from: accountObj.address, data: contractData })
  .then((gas) => {
    const rawTx = {
      from: accountObj.address,
      gas,
      data: contractData,
    };
    web3.eth.accounts
      .signTransaction(rawTx, accountObj.privateKey)
      .then(({ rawTransaction, transactionHash }) => {
        web3.eth
          .sendSignedTransaction(rawTransaction)
          .on("receipt", console.log);

        waitForReceipt(transactionHash, (result) => {
          console.log("The contract is deployed at ", result.contractAddress);
        });
      });
  });

// function to poll until transaction gets mined
function waitForReceipt(hash, cb) {
  web3.eth.getTransactionReceipt(hash, function (err, receipt) {
    if (err) {
      console.error(err);
    }
    if (receipt) {
      // Transaction went through
      if (cb) {
        cb(receipt);
      }
    } else {
      // Try again in 1 second
      console.log("Waiting to get mined...");
      setTimeout(function () {
        waitForReceipt(hash, cb);
      }, 1000);
    }
  });
}
               
// deployed at 0x59A5f50aE0C0320d110656e7928AA466B5d29e71 on rinkeby

/* OUTPUT 
The contract is deployed at  0x59A5f50aE0C0320d110656e7928AA466B5d29e71

{ blockHash:
  '0x9323df399f0777daa230bf11100ba4f71b1358736edde55ecf75eb42d3113309',
 blockNumber: 6853163,
 contractAddress: '0x59A5f50aE0C0320d110656e7928AA466B5d29e71',
 cumulativeGasUsed: 883648,
 from: '0xe7da007c40a37fa4d8f0dd754233958cab3e2722',
 gasUsed: 160989,
 logs: [],
 logsBloom:
  '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
 status: true,
 to: null,
 transactionHash:
  '0xf2d1d825a794751f8c897a666cbf3d75b05794c862367ddeb4a70e246b849b3f',
 transactionIndex: 7 }
 */