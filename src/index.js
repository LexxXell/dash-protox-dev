require("dotenv").config();

const dashcore = require("@dashevo/dashcore-lib");
const { getUTXOsByAddresses } = require("./getUTXOsByAddresses");
const {Address, PrivateKey, Script} = require("@dashevo/dashcore-lib");

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

// Function to create and sign a transaction
async function createAndSignTransaction() {
    // Fetch UTXOs using the getUTXOsByAddresses function
    const utxos = await getUTXOsByAddresses([multisigAddress.toString()]);

    if (utxos.length === 0) {
        console.log("No UTXOs available for this multisig address.");
        return;
    }

    const utxo = utxos[0]

    const script = new Script(utxo.script)

    const output = {
        txId: utxo.txid,
        outputIndex: utxo.outputIndex,
        script,
        satoshis: utxo.satoshis,
    }

    const transaction = new dashcore.Transaction()
        .from(output, publicKeys, 3)
        .change(multisigAddress.toString())
        .to("yerUGLECvbk54j2Ya77Lvg8KTN1eTVPsqX", 90000);

    console.log("Transaction:", transaction);

    const input = transaction.inputs[0];

    console.log("Transaction Inputs:", JSON.stringify(input, null, 2));

    transaction.sign(privateKey1);
    transaction.sign(privateKey2);
    transaction.sign(privateKey3);

    console.log("Transaction HEX:", transaction.toString('hex'));

}

// Run the function
createAndSignTransaction().catch(console.error);
