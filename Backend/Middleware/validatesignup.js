const validatesignup=(req,res,next)=>{

    const {username,mail,password,repassword,position}=req.body;
    if (username === "" || mail === "" || password === "" || repassword === "" || position === ""){

        return res.status(400).send('All fields are required');

    }
    next();
}

module.exports=validatesignup;