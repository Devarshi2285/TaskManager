const Employee = require('../Models/Emplyoee.model');
const crypto = require('crypto');

async function getRecipientPublicKey(recipientId) {
    try {
        // Retrieve the recipient's public key from the database
        const recipient = await Employee.findById(recipientId).select('publicKey');

        // Check if the recipient exists and has a public key
        if (!recipient || !recipient.publicKey) {
            throw new Error('Recipient not found or public key missing');
        }

        // Return the public key
        return recipient.publicKey;
    } catch (err) {
        // Handle any errors that occur during the database query
        throw new Error(`Error fetching recipient public key: ${err.message}`);
    }
}

async function encryptMessage(message, recipientId) {
    try {
        
        // Retrieve the recipient's public key
        const recipientPublicKey = await getRecipientPublicKey(recipientId);

        // Encrypt the message using the recipient's public key
        const encryptedBuffer = crypto.publicEncrypt(recipientPublicKey, Buffer.from(message, 'utf8'));

        // Return the encrypted message as a base64-encoded string
        
        return encryptedBuffer.toString('base64');
    } catch (err) {
        // Handle any errors that occur during encryption
        throw new Error(`Error encrypting message: ${err.message}`);
    }
}

module.exports = encryptMessage;
