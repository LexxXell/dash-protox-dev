require("dotenv").config();

const dashcore = require("dashcore-lib");
const { getUTXOsByAddresses } = require("./getUTXOsByAddresses");

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
const multisigScript = dashcore.Script.buildMultisigOut(publicKeys, 3);
const multisigAddress = new dashcore.Address.payingTo(
  multisigScript,
  dashcore.Networks.testnet
);

console.log("P2SH Multisig Address (3-of-3):", multisigAddress.toString());

// Function to create and sign a transaction
async function createAndSignTransaction() {
  try {
    // Fetch UTXOs using the getUTXOsByAddresses function
    const utxos = await getUTXOsByAddresses([multisigAddress.toString()]);

    if (utxos.length === 0) {
      console.log("No UTXOs available for this multisig address.");
      return;
    }

    const transaction = new dashcore.Transaction()
      .from({ ...utxos[0], script: multisigScript })
      .to("yerUGLECvbk54j2Ya77Lvg8KTN1eTVPsqX", 90000)
      .fee(1000); // Transaction fee in satoshis

    console.log("Transaction:", transaction);

    // Sign the transaction with all three private keys (3-of-3)
    transaction.inputs.forEach((input, index) => {
      transaction.sign(
        [privateKey1, privateKey2, privateKey3],
        dashcore.crypto.Signature.SIGHASH_ALL,
        multisigScript,
        index
      );
    });

    console.log("Signed transaction:", transaction.toString());
  } catch (error) {
    console.error(
      "An error occurred while creating or signing the transaction:",
      error
    );
  }
}

// Run the function
createAndSignTransaction();
