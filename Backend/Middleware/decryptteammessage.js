const crypto = require('crypto');
require('dotenv').config();
// Define a shared secret key for encryption and decryption
const APP_KEY = process.env.APP_KEY;

function decryptTeamMessage(encryptedMessage) {
    const [iv, encrypted] = encryptedMessage.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(APP_KEY, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  module.exports=decryptTeamMessage;