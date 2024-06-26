const emp=require('../Models/Emplyoee.model');

const checkUserExistence=async (req,res,next)=>{

    try{
        const {username,mail}=req.body;
        const findUser=await emp.findOne({$or:[{'name':username},{'email':mail}] });
        if(findUser){
           return res.status(400).send('User Already exits');
        }
        next();
    }
    catch(err){
        console.log(err);
        res.status(500).send('Internal sever error');
    }

}

module.exports=checkUserExistence;