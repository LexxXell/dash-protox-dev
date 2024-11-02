const crypto = require('crypto');
const BlsSignatures = require('@dashevo/bls');

/**
 * @param {string} privateKeyHex
 * @returns {Promise<void>}
 */
async function getBLSPublicKeyFromPrivateKeyHex(privateKeyHex) {
  const { PrivateKey } = await BlsSignatures();

  const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');

  const privateKey = PrivateKey.fromBytes(
    privateKeyBuffer,
    true,
  );

  const publicKey = privateKey.getG1();

  return Buffer.from(publicKey.serialize()).toString('hex');
}

if (require.main === module) {
  const privateKeyHex = crypto.randomBytes(32).toString('hex');
  getBLSPublicKeyFromPrivateKeyHex(privateKeyHex).then(console.log).catch(console.error);
}

module.exports = getBLSPublicKeyFromPrivateKeyHex;