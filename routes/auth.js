const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {body,validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fetchUser = require('../middleware/fetchUser');


router.post('/create-user',[
    body('name').isLength({min:5}).withMessage('Enter a valid name (have to contain atleast 5 characters)'),
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({min:5}).withMessage('Enter the password with minimun five characters')
    ],
    async(req,res)=>{
    const result = validationResult(req);
    if (result.isEmpty()) {
        let user = await User.find({email:req.body.email});
        if(user.length > 0){
            return res.json({message:"This email already exists.. Try again"});
        } 
        else{
            const salt =await bcrypt.genSalt(10);
            const securedPassword = await bcrypt.hash(req.body.password,salt);
            User.create({
                name:req.body.name,
                email:req.body.email,
                password:securedPassword,
            })
            .then((user)=>{
                // res.json(user);
                const payload ={
                    name : user.name,
                    email:user.email,
                    id:user._id
                }
                const privateKey = process.env.JWT_SECRET_KEY;
                const token = jwt.sign(payload, privateKey);
                res.json({token});
            })
            .catch((err)=>{
                res.json({message:"Something went wrong"});
            })
        }
    }
    else{
        return res.send({ errors: result.array() }).status(400);
    } 
})

router.post('/login',[
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').exists().withMessage('Password cannot be left blank')
    ],
    async(req,res)=>{
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.send({ errors: result.array() }).status(400);
        }
        const {email,password} = req.body;
        try{
            let user = await User.findOne({email});
            if(!user){
                return res.send({ error : "Enter correct credentials 1" }).status(400);
            }

            const comparePassword = await bcrypt.compare(password,user.password);

            if(!comparePassword){
                return res.send({ error : "Enter correct credentials 2" }).status(400);           
            }

            const payload ={
                name : user.name,
                email:user.email,
                id:user._id
            }
            const privateKey = process.env.JWT_SECRET_KEY;
            const token = jwt.sign(payload, privateKey);
            res.json({token});
        }
        catch(err){
            console.log(err.message);
            console.log(err);
            return res.send({ error : "Something went wrong" }).status(400);
        }
    }
)

router.post('/getuser',fetchUser,async(req,res)=>{
    try{
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    }
    catch(err){
        console.log(err.message);
        console.log(err);
        return res.send({ error : "Something went wrong" }).status(400);
    }
}) 

module.exports = router;