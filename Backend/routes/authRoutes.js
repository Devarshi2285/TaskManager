const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Employee = require('../Models/Emplyoee.model.js');
const validatesignup = require('../Middleware/validatesignup');
const checkUserExistence = require('../Middleware/checkUserExistence');
const validatesignin = require('../Middleware/validatesignin');
const generateToken = require('../Middleware/generateToken');
const generaterefreshtoken = require('../Middleware/generaterefreshtoken');
const authtoken = require('../Middleware/authtoken');
const encryptPrivateKey = require('../Middleware/encryptprivatekey.js');
const generateKeyPair = require('../Middleware/GenerateKeys');
require('dotenv').config();

const router = express.Router();

router.post('/signup', validatesignup, checkUserExistence, async (req, res) => {
    const { username, password, mail, experience } = req.body;

    try {
     
      const saltrounds = parseInt(process.env.BCRYPT_SALT_ROUNDS); // Parse as integer
      const hashedPassword = await bcrypt.hash(password, saltrounds);
      

      const KeyPair = generateKeyPair();
      const appkey=process.env.APP_KEY;
      
      if(!appkey){
        throw new Error('appkeynot found');
      }

      const encryptedPvtKey=encryptPrivateKey(KeyPair.privateKey,appkey);
      
      const newEmp = new Employee({
        name: username,
        password: hashedPassword,
        email: mail,
        Experience: experience,
        publicKey:KeyPair.publicKey,
        privateKey:encryptedPvtKey
      });
        

      await newEmp.save();
      res.status(200).json({message:'Signup successful'});
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

  router.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await validatesignin(username, password);
      if (!user) {
        return res.status(404).json({message:'Invalid username or password'});
      }
      const token = await generateToken(user);
      const refreshtoken = await generaterefreshtoken(user);
      const emp = await Employee.findOne({ name: username });
      emp.refreshtoken = refreshtoken;
     
      await emp.save();

      res.status(200).json({ token:token, refreshtoken:refreshtoken });
    } catch (err) {
      console.error(err);
      res.status(500).json({message:'Internal Server Error'});
    }
  });
router.post('/getuserdata',authtoken,async(req,res)=>{

    const {id}=req.body;

    try{

      const user = await Employee.findById(id)
     .populate('teams')
  .exec();
      res.status(200).json({user:user});

    }
    catch(err){
      console.log(err);
      res.status(401).json({message:err});
    }

  });

  router.get(('/profile'), authtoken, (req, res) => {

    try{
    res.status(200).json({ message: 'This is the user profile', username: req.user.username });
    }
    catch(err){
      console.log(err);
      res.status(401).json({message:err});
    }
  });
  router.get(('/getid'), authtoken, (req, res) => {

    res.json({ message: 'This is the user profile', userid: req.user.id });

  });

  router.post('/getreceivername',authtoken,async (req,res)=>{

          const {receiverid}=req.body;
          const data = await Employee.findById(receiverid);

          const name=data.name;

          res.status(200).json({username:name});

  });

  router.post(('/token'), async (req, res) => {

    const { refreshtoken } = req.body;
    
    if (!refreshtoken) {
      return res.status(401).json({ message: 'No refreshtoken provided' });
    }

    try {
      const decoded = jwt.verify(refreshtoken, process.env.REFRESH_TOKEN_GENERATION_KEY);
      const user = await Employee.findById(decoded.objectId);

      if (!user || user.refreshtoken !== refreshtoken) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      const newAccessToken = await generateToken(user);

      res.json({ newAccessToken });
    } catch (err) {
      console.error(err.message);
      res.status(401).json({ message: 'refresh Token is not valid' });
    }


  });
  router.post('/getrecipientpublickey',authtoken,async (req,res)=>{

    const {recipientId}=req.body;

    try{

      const recipientPublicKey=await Employee.findById(recipientId).select('publicKey');

      res.status(200).json({recipientPublicKey:recipientPublicKey});

    }
    catch(err){
        res.status(401).json({message:err});
    }

  })

  module.exports = router;
