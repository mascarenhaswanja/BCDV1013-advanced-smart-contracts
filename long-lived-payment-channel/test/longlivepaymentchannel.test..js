const LongLivedPaymentChannel = artifacts.require("LongLivedPaymentChannel");

contract(
  "Recipient should be able to withdraw amount and then close",
  (accounts) => {
    // declare all global variables here
    let contractInstance;
    let contractAddress;
    let longLivedPaymentChannelTx
    const skey =
        "a0ecc9afd5cceccc1da763f3e25ac988d90b76d8e90b2eb4e4eba5471362c4fd"; // private key 
          //                    0x0399b0338ee43a56f820927609580bc7d7965ff6    account

   //   "dec072ad7e4cf54d8bce9ce5b0d7e95ce8473a35f6ce65ab414faea436a2ee86"; // private key
    web3.eth.accounts.wallet.add(`0x${skey}`);
    const masterAccount = accounts[0];
    const sender = web3.eth.accounts.wallet[0].address;
    const senderSkey = web3.eth.accounts.wallet[0].privateKey;
    const recipient = accounts[1];
    const closeDuration = 200;
    const depositAmount = web3.utils.toWei("2", "ether");

    console.log("masterAccount ", masterAccount);
    console.log("sender ", sender);
    console.log("recipient ", recipient);

    // sender can open the channel (deploy contract and deposit funds)
    before(async () => {
      await web3.eth.sendTransaction({
        from: masterAccount,
        to: sender,
        value: web3.utils.toWei("5", "ether"),
        gas: 21000,
      });
      contractInstance = new web3.eth.Contract(LongLivedPaymentChannel.abi);
      const gas = await contractInstance
        .deploy({
          data: LongLivedPaymentChannel.bytecode,
          from: sender,
          value: depositAmount,
          arguments: [recipient, closeDuration],
        })
        .estimateGas();
      longLivedPaymentChannelTx = await contractInstance
        .deploy({
          data: LongLivedPaymentChannel.bytecode,
          arguments: [recipient, closeDuration],
        })
        .send({
          from: sender,
          gas,
          value: depositAmount,
        });
      contractAddress = longLivedPaymentChannelTx.options.address;
      const actualSender = await longLivedPaymentChannelTx.methods.sender().call({
        from: recipient,
      });
      const actualRecipient = await longLivedPaymentChannelTx.methods.recipient().call({
        from:accounts[2]
      });
      const actualCloseDuration = await longLivedPaymentChannelTx.methods.closeDuration().call({
        from:accounts[2]
      })
      const actualDepositedAmount = await web3.eth.getBalance(contractAddress);

      // assertions
      assert.equal(actualSender, sender, "Sender is not as expected");
      assert.equal(
        actualDepositedAmount,
        depositAmount,
        "The deposited amount is as expected"
      );
      assert.equal(
        actualRecipient,
        recipient,
        "The recipient is as expected"
      );
      assert.equal(actualCloseDuration,closeDuration,"closeDuration is not as expected")
    });

    it("the recipient should be able to withdraw from the channel", async () => {
      // code that will sign for recipient to withdraw
      //***  withdraw(uint256 amountAuthorized, bytes memory signature)

      const withdrawAmount = web3.utils.toWei("1", "ether");
      const message = web3.utils.soliditySha3(
        { t: "address", v: contractAddress },
        { t: "uint256", v: withdrawAmount }
      );
      const sig = await web3.eth.accounts.sign(message, senderSkey);

      // recipient will use the signed message to claim the amount
      const recipientBalance = await web3.eth.getBalance(recipient);
      const withdrawTx = await longLivedPaymentChannelTx.methods
        .withdraw(withdrawAmount, sig.signature)
        .send({ from: recipient });

      const trx = await web3.eth.getTransaction(withdrawTx.transactionHash);
      const transactionFee = web3.utils
        .toBN(trx.gasPrice)
        .mul(web3.utils.toBN(withdrawTx.gasUsed));

      const calculatedRecipientBalance = web3.utils.toBN(recipientBalance).add(web3.utils.toBN(withdrawAmount)).sub(web3.utils.toBN(transactionFee));
      const recipientNewBalance = await web3.eth.getBalance(recipient);
      assert.equal(calculatedRecipientBalance,recipientNewBalance,"The balance of recipient is not as expected.");
    });

    it("the recipient should be able to close the channel by presenting a signed", async () => {
      // the recipient should be able to close the 
      // The recipient can close the channel at any time by presenting a signed
      // amount from the sender. The recipient will be sent that amount, and the
      // remainder will go back to the sender.
      // function close(uint256 amount, bytes memory signature)
      // make necessary assertions to validate balance of sender and recipient
      
      const closeAmount = web3.utils.toWei("1", "ether");
      const message = web3.utils.soliditySha3(
        { t: "address", v: contractAddress },
        { t: "uint256", v: closeAmount }
      );

      const sig = await web3.eth.accounts.sign(message, senderSkey);
          
      const closeTx = await longLivedPaymentChannelTx.methods
        .close(closeAmount, sig.signature)
        .send({ from: recipient });
      
      const recipientCloseBalance = await web3.eth.getBalance(recipient);
      console.log("recipientCloseBalance ", recipientCloseBalance); 

      const trxClose = await web3.eth.getTransaction(closeTx.transactionHash);
      const transactionCloseFee = web3.utils
        .toBN(trxClose.gasPrice)
        .mul(web3.utils.toBN(closeTx.gasUsed));

      const calculatedCloseBalance = web3.utils.toBN(recipientCloseBalance).add(web3.utils.toBN(closeAmount)).sub(web3.utils.toBN(transactionCloseFee));
      console.log("recipientCloseBalance ", recipientCloseBalance);
      console.log("closeAmount ", closeAmount);
      console.log("transactionCloseFee ", transactionCloseFee);

      assert.equal(calculatedCloseBalance,recipientCloseBalance,"The balance closed is not as expected.")
    });
  }
);

