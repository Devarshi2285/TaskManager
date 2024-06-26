const crypto = require('crypto');
require('dotenv').config();
// Define a shared secret key for encryption and decryption
const APP_KEY = process.env.APP_KEY;

// Encryption function
function encryptTeamMessage(message) {
  const iv = crypto.randomBytes(16); // Generate a random initialization vector
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(APP_KEY, 'hex'), iv);
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const encryptedMessage = iv.toString('hex') + ':' + encrypted; // Combine iv and encrypted message with a separator
  return encryptedMessage;
}

module.exports = encryptTeamMessage;
