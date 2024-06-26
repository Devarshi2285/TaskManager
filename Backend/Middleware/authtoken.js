// middleware/auth.js

const jwt = require('jsonwebtoken');
require('dotenv').config();
const authtoken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Assuming token is in 'Authorization: Bearer <token>' format
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // console.log("this is token"+token);
    const decoded = jwt.verify(token, process.env.TOKEN_GENERATION_KEY);
    req.user = {username:decoded.username,id:decoded.objectId};
    next();
  } catch (err) {
    console.log("Error in Auth:\n"+err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authtoken;
