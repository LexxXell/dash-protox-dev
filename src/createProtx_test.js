require("dotenv").config();

const dashcore = require("@dashevo/dashcore-lib");
const RegisteredPayloadTypes = require('@dashevo/dashcore-lib/lib/constants').registeredTransactionTypes;

const { getUTXOsByAddresses } = require("./getUTXOsByAddresses");
const { Transaction } = dashcore;
const ProRegTxPayload = Transaction.Payload.ProRegTxPayload;

const privateKey1 = dashcore.PrivateKey.fromWIF(process.env.PRIVATE_KEY_1);

if (!privateKey1) {
  console.log("Please set env PRIVATE_KEY_1");
  process.exit(1);
}

const publicKey1 = privateKey1.toPublicKey();

const publicKeyHash = dashcore.crypto.Hash.ripemd160(publicKey1.toBuffer());

console.log('keyIDOwner (CKeyID):', publicKeyHash.toString("hex"));

process.exit(0);

const address = new dashcore.Address(
  publicKey1,
  dashcore.Networks.testnet
);

console.log(address.toString(), "\n\n##############\n\n");

async function main() {
  const payload = ProRegTxPayload.fromJSON({
    version: 2,

    collateralHash: '5961c078407f5b0cc5a862ad5aade04b78341f848cd5e9b1b83662aaee253c4a',
    collateralIndex: 1,

    pubKeyOperator: '8b680da2d89a12891c9b797552c2edfb7dd89047f0ccf9e8a62613d03e9e3baa96ecdf20090371adf72c3e3bf306dcd6',
    operatorReward: 0,

    keyIDOwner: '3c05fb32367a25d8dedc16f741b8492006fb948a',
    keyIDVoting: '3c05fb32367a25d8dedc16f741b8492006fb948a',
    payoutAddress: 'yh9o9kPRK1s3YsuyCBe3DEjBit2RnzhgwH',

    service: '195.141.0.143:19999',
    platformP2PPort: 36656,
    platformHTTPPort: 1443,

    inputsHash: '0b5e6a319019d8f1f4b17da96964df507e417f0a0ef8ca63eaa01e33e05510bc',
  });

  console.log(payload.toJSON());

  const utxos = await getUTXOsByAddresses([address.toString()]);

  // const transaction = new Transaction()
  //     .from(utxos[0])
  //     .to(address.toString(), 10000)
  //     .change(address.toString())
  //     .setType(1)
  //     .setExtraPayload(payload)
  //     .sign(privateKey1);
  //
  // console.log("Transaction HEX: ", transaction.toString('hex'));
}

main().catch(console.error);
