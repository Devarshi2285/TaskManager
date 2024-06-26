const emp=require('../Models/Emplyoee.model');
const bcrypt=require('bcrypt');

const validatesignin=async (username,password)=>{

    try{


        const user=await emp.findOne({'name':username});
       
        if(user){

            const issamepassword=await bcrypt.compare(password,user.password);
            if(issamepassword){
                return user;
            }
        }

        return false;

    }
    catch(err){
        console.log(err);
    }

}

module.exports=validatesignin;