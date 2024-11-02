require("dotenv").config();

const dashcore = require("@dashevo/dashcore-lib");
const {Address, PrivateKey, Script, PublicKey, Transaction} = require("@dashevo/dashcore-lib");
const {PublicKeyHash: PublicKeyHashInput} = require("@dashevo/dashcore-lib/lib/transaction/input");
const {getUTXOsByAddresses} = require("./getUTXOsByAddresses");

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

// Function to create and sign a transaction
async function getUTXOS() {

    const utxos1 = await getUTXOsByAddresses([address1.toString()]);
    console.log("UTXO_1", utxos1, '\n');

    const utxos2 = await getUTXOsByAddresses([address2.toString()]);
    console.log("UTXO_2", utxos2, '\n');

    const utxos3 = await getUTXOsByAddresses([address3.toString()]);
    console.log("UTXO_3", utxos3);
}

// Run the function
getUTXOS().catch(console.error);
