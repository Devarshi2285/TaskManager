const jwt=require('jsonwebtoken');
require('dotenv').config();
const generateToken=async (user)=>{

    try{
   
        const token = jwt.sign({ objectId: user._id,username:user.name }, process.env.TOKEN_GENERATION_KEY, { expiresIn: '5m'});
       
        return token;
    }
    catch(err){
        console.log(err);
    }
}
module.exports=generateToken;