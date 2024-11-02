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

const address = new dashcore.Address(
  publicKey1,
  dashcore.Networks.testnet
);

console.log(address.toString(), "\n\n##############\n\n");

async function main() {
  const utxos = await getUTXOsByAddresses([address.toString()]);

  const payload = ProRegTxPayload.fromJSON({
    version: 2,
    collateralHash: '8f1c6aea26dd616c1d3916e2bb9f53368058cef9b2496cea8f371525eb6bf62d',
    collateralIndex: 0,
    service: '195.141.0.143:19999',
    keyIDOwner: '3c05fb32367a25d8dedc16f741b8492006fb948a',
    pubKeyOperator: '8273ec203d1ea62cbdb54e10618329e4ed93e99bc9c5ab2f4cb0055ad281f9ad0808a1dda6aedf12c41c53142828879b',
    keyIDVoting: '3c05fb32367a25d8dedc16f741b8492006fb948a',
    payoutAddress: 'yh9o9kPRK1s3YsuyCBe3DEjBit2RnzhgwH',
    operatorReward: 0,
    inputsHash: '0b5e6a319019d8f1f4b17da96964df507e417f0a0ef8ca63eaa01e33e05510bc',
  });

  const transaction = new Transaction()
      .from(utxos[0])
      .to(address.toString(), 10000)
      .change(address.toString())
      .setType(1)
      .setExtraPayload(payload)
      .sign(privateKey1);

  console.log("Transaction HEX: ", transaction.toString('hex'));
}

main().catch(console.error);
