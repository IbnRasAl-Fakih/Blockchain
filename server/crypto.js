const crypto = require('crypto');
const forge = require('node-forge');
const fs = require('fs');

const generateKeyPair = () => {
  return crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
};

const encrypt = (message, publicKey) => {
  const buffer = Buffer.from(data, 'utf8');
  const encryptedData = crypto.privateEncrypt(privateKey, buffer);
  return encryptedData.toString('base64');
};

const decrypt = (encryptedMessage, privateKey) => {
  const buffer = Buffer.from(encryptedData, 'base64');
  const decryptedData = crypto.publicDecrypt(publicKey, buffer);
  return decryptedData.toString('utf8');
};

function createP12File(keyPem, outputPath) {
  const privateKey = forge.pki.privateKeyFromPem(keyPem);
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(privateKey);
  const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  fs.writeFileSync(outputPath, p12Der, 'binary');
}

module.exports = { generateKeyPair, encrypt, decrypt, createP12File }