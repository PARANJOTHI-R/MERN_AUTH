import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodeMailer.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing details' });
    }
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exist" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'welcome to Glossera',
            text: `Welcome to Glossera website. Your account has been created with email id: ${email}`
        }
        transporter.verify((error, success) => {
            if (error) {
                console.error('SMTP connection failed:', error);
            } else {
                console.log('SMTP connection successful');
            }
        });

        await transporter.sendMail(mailOptions)

        return res.json({ success: true });

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ success: false, message: 'Email and Password are required' })
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'Invaild email' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Incorrect Password' });

        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true });

    } catch (error) {
        return res.json({ success: false, message: error.meassage });
    }
}


export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: false, message: 'Logged out' });


    } catch (error) {
        return res.json({ success: false, message: error.message });

    }
}

export const sendVerifyOtp=async(req,res)=>{
    try{
        const {userId}=req.body;
        const user= await userModel.findById(userId);
        if(user.isAccountVerified){
            return res.json({success:false,message:"Account Already verified"})
        }

        const otp=String(Math.floor(100000+Math.random()*900000))

        user.verifyOtp=otp;
        user.verifyOtpExpireAt=Date.now() + 24*60*60*1000


        await user.save();

        const mailOptions={
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verification Otp',
            text:`Your otp is ${otp}. Verify your account using this Otp.`

        }
        await transporter.sendMail(mailOptions);

        res.json({success:true,meassage:'verification Otp sent to Your Email'})

    }catch{
        res.json({success:false,meassage:error.message});
    }
}

export const verifyEmail=async(req,res)=>{
    const {userId,otp}=req.body;

    if(!userId||!otp){
        return res.json({sucess:false,message:'Missing details'});
    }
    try{
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({success:false,message:'User not Found'});
        }

        if(user.verifyOtp===''||user.verifyOtp!==otp){
            return res.json({success:false,message:'Invalid Otp'});
        }
        if(user.verifyOtpExpireAt<Date.now()){
            return res.json({success:false,message:'Otp Expired'});
        }
        user.isAccountVerified=true;
        user.verifyOtp=''
        user.verifyOtpExpireAt=0;
        await user.save();

        return res.json({success:true,message:'Email verified successfully'})

    } catch (error){
        return res.json({success:false,message:error.message});

    }
}

export const isAuthenticated=async(req,res)=>{
    try{
        return res.json({success:true})
    }catch(error){
        return res.json({success:false,message:error.message});
    }
}


export const sendResetOtp=async(req,res)=>{
    const {email}=req.body;
    if(!email){
        return res.json({success:false,message:"Email is required"})
    }
    
    try{
        const user=await userModel.findOne({email});
        if(!user){
        return res.json({success:false,message:"User does not exist"})    
        }

        const otp=String(Math.floor(100000+Math.random()*900000))

        user.resetOtp=otp;
        user.resetOtpExpireAt=Date.now() + 15*60*1000


        await user.save();

        const mailOptions={
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password reset Otp',
            text:`Your otp is ${otp}. Reset your account Password using this Otp.`

        }
        await transporter.sendMail(mailOptions);
        return res.json({success:true,message:"Otp sent to your mail"})

    }catch(error){
        return res.json({success:false,message:error.message});
    }
}


//reset user pass

export const resetPass=async(req,res)=>{
    const {otp,email,newPass}=req.body;
    if(!email||!otp||!newPass){
        return res.json({success:false,message:"Email otp and new password are required"})
    }
    try{
        const user =await userModel.findOne({email});
        if(!user){
        return res.json({success:false,message:"User not found"})    ;
        }

        if(user.resetOtp===""|| user.resetOtp!==otp){
        return res.json({success:false,message:"Invalid Otp"})    
        }
        if(user.resetOtpExpireAt<Date.now()){
        return res.json({success:false,message:"Otp Expired"})    
        }

        const hashedPassword=await bcrypt.hash(newPass,10);

        user.password=hashedPassword;
        user.resetOtp=''
        user.resetOtpExpireAt=0;

        await user.save();

        res.json({success:true,message:"Password have been reseted successfully"});

    }
    catch(error){
        return res.json({success:false,message:error.message});

    }
}