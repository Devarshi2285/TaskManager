const crypto = require('crypto');

function generateKeyPair() {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048, // Key size
        publicKeyEncoding: {
            type: 'pkcs1', // Public Key Cryptography Standards 1
            format: 'pem' // Privacy Enhanced Mail (PEM) format
        },
        privateKeyEncoding: {
            type: 'pkcs1', // Public Key Cryptography Standards 1
            format: 'pem' // Privacy Enhanced Mail (PEM) format
        }
    });
}
module.exports = generateKeyPair;