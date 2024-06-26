const jwt=require('jsonwebtoken');
const emp=require('../Models/Emplyoee.model');
require('dotenv').config();
const generaterefreshtoken=async (user)=>{

    try{
        const refreshtoken=jwt.sign({ objectId: user._id,username:user.name },process.env.REFRESH_TOKEN_GENERATION_KEY, { expiresIn: '1d'});
       
        // emp.refreshtoken=refreshtoken;
       
        return refreshtoken;
    }
    catch(err){
        console.log(err);
    }
}
module.exports=generaterefreshtoken;