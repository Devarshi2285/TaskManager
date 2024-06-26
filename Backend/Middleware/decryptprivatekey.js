const crypto = require('crypto');
const Employee = require('../Models/Emplyoee.model');

async function fetchPrivateKey(recipientId) {
    try {
        // Fetch the user document from the database
        const user = await Employee.findById(recipientId);

        // Check if the user exists and has a private key
        if (!user || !user.privateKey) {
            throw new Error('User not found or private key missing');
        }

        // Return the private key
        return user.privateKey;
    } catch (error) {
        console.error('Error fetching private key:', error);
        throw error;
    }
}

async function decryptPrivateKey(appKey, recipientId) {
    try {
        // Retrieve the private key of the user
        const privateKey = await fetchPrivateKey(recipientId);

        // Decrypt the private key using the provided appKey
        const parts = privateKey.split(':');
        const iv = Buffer.from(parts[0], 'base64');
        const encryptedData = Buffer.from(parts[1], 'base64');
        const key = crypto.createHash('sha256').update(String(appKey)).digest(); // Ensure 32 bytes key
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Error decrypting private key:', error);
        throw error;
    }
}

module.exports = decryptPrivateKey;
