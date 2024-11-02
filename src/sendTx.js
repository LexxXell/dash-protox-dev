const { initClient } = require('./client');
const dashcore = require("@dashevo/dashcore-lib");

const fee = 1000; // Fixed fee

const client = initClient({ mnemonic: 'three jump balcony area dune vendor rely confirm october laugh want breeze' });
const { wallet } = client;

async function createAndSendTransaction() {
  const account = await wallet.getAccount();

  // Fetch all UTXOs
  const UTXOs = await account.getUTXOS();

  if (UTXOs.length === 0) {
    console.error('No UTXOs available to create transaction');
    return;
  }

  // Calculate total satoshis and check fee
  const totalAmount = UTXOs.reduce((sum, utxo) => sum + utxo.satoshis, 0);
  const amountToSend = totalAmount - fee;

  if (amountToSend <= 0) {
    console.error('Insufficient funds for transaction fee');
    return;
  }

  // Create transaction with OP_RETURN in outputs
  const transaction = new dashcore.Transaction()
    .from(UTXOs)                                 // Use all UTXOs
    .addOutput(new dashcore.Transaction.Output({  // Add OP_RETURN output
      script: dashcore.Script.buildDataOut("data"),
      satoshis: 0
    }))
    .fee(fee);

  // Sign and broadcast transaction
  account.sign(transaction);
  const txid = await account.broadcastTransaction(transaction);
  console.log(`Transaction broadcasted! TXID: ${txid}`);
}

createAndSendTransaction().catch(console.error).finally(() => client.disconnect());
