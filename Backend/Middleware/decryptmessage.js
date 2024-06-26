const decryptPrivateKey =require("../Middleware/decryptprivatekey");
const crypto =require('crypto');

async function decryptMessage(encryptedMessage,recipientId,appKey) {
    const pvtKey=await decryptPrivateKey(appKey,recipientId);
    const decryptedBuffer = crypto.privateDecrypt({
        key: pvtKey,
        passphrase: '' // Passphrase if the private key is encrypted
    }, Buffer.from(encryptedMessage, 'base64'));
    return decryptedBuffer.toString('utf8');
}

module.exports= decryptMessage;