require("dotenv").config();

const dashcore = require("@dashevo/dashcore-lib");

const {getUTXOsByAddresses} = require("./getUTXOsByAddresses");
const {PrivateKey, Address, Script} = require("@dashevo/dashcore-lib");
const {Transaction} = dashcore;
const ProRegTxPayload = Transaction.Payload.ProRegTxPayload;

if (!process.env.PRIVATE_KEY_1 || !process.env.PRIVATE_KEY_2 || !process.env.PRIVATE_KEY_3) {
  console.log(
    "Please set env variables PRIVATE_KEY_1, PRIVATE_KEY_2, PRIVATE_KEY_3"
  );
  process.exit(1);
}

// Load private keys from environment variables
const privateKey1 = new PrivateKey(process.env.PRIVATE_KEY_1);
const privateKey2 = new PrivateKey(process.env.PRIVATE_KEY_2);
const privateKey3 = new PrivateKey(process.env.PRIVATE_KEY_3);

// Generate public keys
const publicKey1 = privateKey1.toPublicKey();
const publicKey2 = privateKey2.toPublicKey();
const publicKey3 = privateKey3.toPublicKey();

// Create a 3-of-3 multisig P2SH address
const publicKeys = [publicKey1, publicKey2, publicKey3];

const multisigAddress = new Address(
  publicKeys,
  3,
  "testnet"
);

console.log("P2SH Multisig Address (3-of-3):", multisigAddress.toString());
console.log("\n\n##############\n\n");

async function main() {

  const address = multisigAddress;

  const utxos = await getUTXOsByAddresses([address.toString()]);

  const payload = ProRegTxPayload.fromJSON({
    version: 2,
    collateralHash: 'a65693797d7137a2529f438807a8c7c085d3984ceaa2f4f5230a36b536cbd326',
    collateralIndex: 1,
    service: '195.141.0.143:19999',
    keyIDOwner: '3c05fb32367a25d8dedc16f741b8492006fb948a',
    pubKeyOperator: '8273ec203d1ea62cbdb54e10618329e4ed93e99bc9c5ab2f4cb0055ad281f9ad0808a1dda6aedf12c41c53142828879b',
    keyIDVoting: '3c05fb32367a25d8dedc16f741b8492006fb948a',
    payoutAddress: 'yh9o9kPRK1s3YsuyCBe3DEjBit2RnzhgwH',
    operatorReward: 0,
    inputsHash: '0b5e6a319019d8f1f4b17da96964df507e417f0a0ef8ca63eaa01e33e05510bc',
  });

  const [utxo] = utxos;

  const input = {
    txId: utxo.txid,
    outputIndex: utxo.outputIndex,
    script: new Script(utxo.script),
    satoshis: utxo.satoshis,
  }

  const transaction = new Transaction()
    .from(input, publicKeys, 3)
    .to(address.toString(), 10000)
    .change(address.toString())
    .setType(1)
    .setExtraPayload(payload)
    .sign(privateKey1)
    .sign(privateKey2)
    .sign(privateKey3);


  console.log("Transaction HEX: ", transaction.toString('hex'));
}

main().catch(console.error);
