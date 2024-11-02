const crypto = require('crypto');
const getBLSPublicKeyFromPrivateKeyHex = require("./getBLSPublicKeyFromPrivateKeyHex");

async function generateBlsKeyPair() {
  const privateKeyHex = crypto.randomBytes(32).toString('hex');
  const publicKeyHex = await getBLSPublicKeyFromPrivateKeyHex(privateKeyHex);

  return {secret: privateKeyHex, public: publicKeyHex};
}

if (require.main === module) {
  generateBlsKeyPair().then(console.log).catch(console.error);
}

module.exports = generateBlsKeyPair;