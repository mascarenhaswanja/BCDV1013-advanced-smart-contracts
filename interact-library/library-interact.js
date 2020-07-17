// Inject environemnt variable in this file
require("dotenv").config("./env");

// Import Web3
const Web3 = require("web3");

// Import abi
const abi = require("./interact.json");

// create web3 instance
const web3 = new Web3(
  new Web3.providers.HttpProvider(process.env.URI)
);

// get the account object from private key
// const accountObj = web3.eth.accounts.privateKeyToAccount(
//   process.env.PRIVATE_KEY
// );

// add account to wallet
web3.eth.accounts.wallet.add("0x" + process.env.PRIVATE_KEY);

// get contract instance
const interactContract = new web3.eth.Contract(
  abi,
  process.env.CONTRACT_ADDRESS
);

// Read number of the constructor
interactContract.methods
  .number()
  .call()
  .then((result) => {
    console.log("Initial value of number is ", result);
  });

// Add value to number
interactContract.methods
  .fnAddValue(10)
  .estimateGas()
  .then((gas) => {
    interactContract.methods
      .fnAddValue(10)
      .send({ from: web3.eth.accounts.wallet[0].address, gas });
  });

// deployed at 0x59A5f50aE0C0320d110656e7928AA466B5d29e71 on rinkeby