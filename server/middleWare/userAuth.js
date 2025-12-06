import jwt from 'jsonwebtoken';

const userAuth=async(req,res,next)=>{
    const {token}=req.cookies;
    if(!token){
        return res.json({success:false,message:"Unauthorizd Login try again"})
    }
    if (!req.body) req.body = {};
    try{


        //changed
       const tokenDecode=jwt.verify(token,process.env.JWT_SECRET); 
        if(tokenDecode.id){
            req.body.userId=tokenDecode.id
        }else{
        return res.json({success:false,message:"Unauthorizd Login try again"})
        }

        next();
    }catch(error){
        res.json({success:false,message:error.message})
    }
}

export default userAuth;