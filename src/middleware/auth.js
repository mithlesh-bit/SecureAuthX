const jwt=require("jsonwebtoken")
const Register=require("../models/registers")

const auth=async(req,resp,next)=>{
    try {
        const token  =req.cookies.jwt;
        const verify=jwt.verify(token,process.env.secretKey)
        const user= await Register.findOne({_id:verify._id})
        console.log(user);
        next();

    } catch (error) {
        resp.status(401).send("login timeout please login ")
    }
}

module.exports=auth
