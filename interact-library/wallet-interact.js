// Inject environemnt variable in this file
require("dotenv").config("./env");

// Import Web3
const Web3 = require("web3");

// Import BigNumber
const BigNumber = require("bignumber.js");

// Import ABI - use Remix
const abi = require("./interact.json");

// import compiled bytecode of contract - use Remix
const { bytecode } = require("./bytecode.js");

// create web3 instance
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.URI));

// add account to wallet
web3.eth.accounts.wallet.add("0x" + process.env.PRIVATE_KEY);

const _number = new BigNumber(2);

// get contract instance
const interactContract = new web3.eth.Contract(abi);

// estimateGas and deploy contract
interactContract
  .deploy({
    data: `0x${bytecode}`,
    arguments: [_number],
  })
  .estimateGas()
  .then((gas) => {
    interactContract
      .deploy({
        data: `0x${bytecode}`,
        arguments: [_number],
      })
      .send(
        {
          from: web3.eth.accounts.wallet[0].address,
          gas,
        },
        function (error, transactionHash) {}
      )
      .on("error", function (error) {
        console.log("error", error);
      })
      .on("transactionHash", function (transactionHash) {
        console.log("transactionHash", transactionHash);
      })
      .on("receipt", function (receipt) {
        console.log("receipt", receipt.contractAddress);
      })
      .on("confirmation", function (confirmationNumber, receipt) { // fired till 12th block is mined
        console.log("confirmation", confirmationNumber);
      })
      .on("error", console.error);
  })
  .catch((e) => {
    console.error(e);
  });

// deployed at 0x59A5f50aE0C0320d110656e7928AA466B5d29e71 on rinkeby
// deployed at 0x62944b7Fce8c22D30B5Fd7E8D7f181D7a6E18ab5 on rinkeby
