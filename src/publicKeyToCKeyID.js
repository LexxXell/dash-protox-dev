const dashcore = require("@dashevo/dashcore-lib");

function publicKeyToCKeyID (publicKey) {
  const publicKeyHash = dashcore.crypto.Hash.ripemd160(publicKey.toBuffer());
  return publicKeyHash.toString("hex");
}

if (require.main === module) {
  const privateKey = new dashcore.PrivateKey();
  const publicKey = privateKey.toPublicKey();
  console.log('PrivateKey:', privateKey.toString());
  console.log('PublicKey:', publicKey.toString());
  console.log('CKeyID:', publicKeyToCKeyID(publicKey));
}

module.exports = publicKeyToCKeyID;