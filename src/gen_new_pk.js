require("dotenv").config();

const dashcore = require("@dashevo/dashcore-lib");
const {Address, PrivateKey, Script} = dashcore;

const privateKey1 = new PrivateKey();
const privateKey2 = new PrivateKey();
const privateKey3 = new PrivateKey();

const publicKey1 = privateKey1.toPublicKey();
const publicKey2 = privateKey2.toPublicKey();
const publicKey3 = privateKey3.toPublicKey();

const address1 =  new Address(publicKey1, 'testnet');
const address2 =  new Address(publicKey2, 'testnet');
const address3 =  new Address(publicKey3, 'testnet');


// console.log(
//   `privateKey1: ${privateKey1.toWIF()}\nprivateKey2: ${privateKey2.toWIF()}\nprivateKey3: ${privateKey3.toWIF()}`
// );

console.log(`PrivatKey_1: ${privateKey1}\nAddress_1: ${address1}`);
console.log(`PrivatKey_2: ${privateKey2}\nAddress_2: ${address2}`);
console.log(`PrivatKey_2: ${privateKey3}\nAddress_2: ${address3}`);