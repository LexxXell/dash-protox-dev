require("dotenv").config();

const dashcore = require("@dashevo/dashcore-lib");
const {Address, PrivateKey, Script, PublicKey, Transaction} = require("@dashevo/dashcore-lib");
const {PublicKeyHash: PublicKeyHashInput} = require("@dashevo/dashcore-lib/lib/transaction/input");

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

// Generate addresses
const address1 = new Address(publicKey1, "testnet");
const address2 = new Address(publicKey2, "testnet");
const address3 = new Address(publicKey3, "testnet");

console.log("Address_1: ", address1.toString());
console.log("Address_2: ", address2.toString());
console.log("Address_3: ", address3.toString());
process.exit(0);

const utxo1 =   {
  address: 'yYS3mC9NV2fWieQcADGj5wZxYXqctzriYE',
  txid: 'b2fc3f8a0d840f58ab4e875f4ff26c148047350f8793a03c9275bb6f4276fb55',
  outputIndex: 0,
  script: '76a91484e1264c060ffec0807d862fed01e815b2e9d73b88ac',
  satoshis: 100000000,
  height: 1118673
};
const utxo2 =   {
  address: 'yZ1xebxLuZsmChj2u6Q4C8pTQH2pjtYuSD',
  txid: '7fdff70e36a6249cf118bf9e1bc6b3972e672dd4b4dfc26425b8b6455f652ece',
  outputIndex: 1,
  script: '76a9148b4b060f3ff229e789095c8cff03a3d3199f378788ac',
  satoshis: 100000000,
  height: 1118867
};
const utxo3 = {
  address: 'yMh67r5rrwGucxfzARh3NgXgo1mVAMBXte',
  txid: '51428dc545aab5abcdcdee67e2740c3ee369a6b4a8819d2464a510c5a17bb6d3',
  outputIndex: 1,
  script: '76a9140f0ff8e0d6f2f092573b52c24c79f973ec25d48788ac',
  satoshis: 100000000,
  height: 1118867
};

const input_1 = new PublicKeyHashInput({
  output: utxo1,
  prevTxId: utxo1.txid,
  outputIndex: utxo1.outputIndex,
  script: new Script(utxo1.script)
});
const input_2 = new PublicKeyHashInput({
  output: utxo2,
  prevTxId: utxo2.txid,
  outputIndex: utxo2.outputIndex,
  script: new Script(utxo2.script)
});
const input_3 = new PublicKeyHashInput({
  output: utxo3,
  prevTxId: utxo3.txid,
  outputIndex: utxo3.outputIndex,
  script: new Script(utxo3.script)
});

// console.log(input_1);

const transaction = new Transaction()
  .addInput(input_1)
  .addInput(input_2)
  .addInput(input_3)
  .change('yerUGLECvbk54j2Ya77Lvg8KTN1eTVPsqX')

// Использовать свой оутпут для каждого кошелька инпута.
// Рассчитать остаток не забыть вычесть fee разделить на кол-во кошельков
transaction.addOutput();

// console.log(transaction);

const [signature_1] = input_1.getSignatures(transaction, privateKey1, 0);
const [signature_2] = input_2.getSignatures(transaction, privateKey2, 1);
const [signature_3] = input_3.getSignatures(transaction, privateKey3, 2);

transaction.applySignature(signature_1);
transaction.applySignature(signature_2);
transaction.applySignature(signature_3);

console.log(transaction.toString());

// console.log(signature_2.signature.toString());
// console.log(signature_3.signature.toString());

// Function to create and sign a transaction
// async function main() {
//
//
//
//   const input1 = new PublicKeyHashInput(utxo1, publicKey1);
//   return console.log(input1);
//
//   // Делать через addInput
//   const transaction = new dashcore.Transaction()
//     .from(inputs)
//     // .change("yerUGLECvbk54j2Ya77Lvg8KTN1eTVPsqX")
//     .to("yMssCkUcfYrv6kowYFUd2eB9kbCVsERS7L", 90000);
//
//   const [signature1] = transaction.getSignatures(privateKey1);
//   const [signature2] = transaction.getSignatures(privateKey2);
//   const [signature3] = transaction.getSignatures(privateKey3);
//
//   console.log("Transaction signature1:", signature1.signature.toString('hex'));
//   console.log("Transaction signature2:", signature2.signature.toString('hex'));
//   console.log("Transaction signature3:", signature3.signature.toString('hex'));
//
//   // console.log("Transaction: ", transaction);
//
//   // transaction.applySignature(signature);
//   //
//   // console.log("Transaction HEX:", transaction.toString('hex'));
//
// }
//
// // Run the function
// main().catch(console.error);
