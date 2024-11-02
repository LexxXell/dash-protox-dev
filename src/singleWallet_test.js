require("dotenv").config();

const dashcore = require("@dashevo/dashcore-lib");
const { getUTXOsByAddresses } = require("./getUTXOsByAddresses");
const { Transaction } = dashcore;

const privateKey1 = dashcore.PrivateKey.fromWIF(process.env.PRIVATE_KEY_1);

if (!privateKey1) {
  console.log("Please set env PRIVATE_KEY_1, PRIVATE_KEY_2, PRIVATE_KEY_3");
  process.exit(1);
}

const publicKey1 = privateKey1.toPublicKey();

const address = new dashcore.Address(
  publicKey1,
  dashcore.Networks.testnet
);

console.log(address.toString(), "\n\n##############\n\n");

async function main() {
  const utxos = await getUTXOsByAddresses([address.toString()]);

  const transaction = new Transaction();
  transaction.from(utxos)
    .to('yerUGLECvbk54j2Ya77Lvg8KTN1eTVPsqX', 90000)
    .fee(1000)
    // .sign([privateKey1], 1);

  const signature = transaction.getSignatures(privateKey1);
  console.log("Signature: ", signature);

  transaction.applySignature(signature);
  // console.log("Transaction: ", transaction.toJSON());
}

main().catch(console.error);
