const crypto = require('crypto');

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
  const encryptedMessage = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(message)
  );

  return encryptedMessage.toString('base64');
};

const decrypt = (encryptedMessage, privateKey) => {
  const decryptedMessage = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(encryptedMessage, 'base64')
  );

  return decryptedMessage.toString();
};

const sign = (data, privateKey) => {
  const sign = crypto.createSign('SHA256');
  sign.update(data);
  const signature = sign.sign(privateKey, 'base64');
  return signature;
};

const verify = (data, signature, publicKey) => {
  const verify = crypto.createVerify('SHA256');
  verify.update(data);
  return verify.verify(publicKey, signature, 'base64');
};

module.exports = { generateKeyPair, encrypt, decrypt, sign, verify } 

// const { publicKey, privateKey } = generateKeyPair();

// const originalMessage = 'Hello, RSA!';

// const encryptedMessage = encrypt(originalMessage, publicKey);
// console.log('Encrypted Message:\n', encryptedMessage);

// const decryptedMessage = decrypt(encryptedMessage, privateKey);
// console.log('Decrypted Message:\n', decryptedMessage);

// const signature = sign(originalMessage, privateKey);
// console.log('Signature:\n', signature);

// const isSignatureValid = verify(originalMessage, signature, publicKey);
// console.log('Is Signature Valid:', isSignatureValid);