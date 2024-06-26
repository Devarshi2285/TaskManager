// middleware/auth.js

const jwt = require('jsonwebtoken');
const emp=require('../Models/Emplyoee.model');

const auth = async (req, res, next) => {
    const { token } = req.body; // Assuming token is in 'Authorization: Bearer <token>' format

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
      }
  try {
    const decoded = jwt.verify(token, 'H3uA5sE#r7T*dF8');
    const user = await emp.findById(decoded.user._id);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
