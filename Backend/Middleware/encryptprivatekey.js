const crypto = require('crypto');

function encryptPrivateKey(privateKey, appKey) {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(String(appKey)).digest(); // Ensure 32 bytes key
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return iv.toString('base64') + ':' + encrypted;
}
module.exports= encryptPrivateKey;