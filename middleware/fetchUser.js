const jwt = require('jsonwebtoken');
require('dotenv').config();

const fetchUser = (req,res,next) =>{
    // Get the user from jwt token and add id to the req object
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({error:"Please authenticate using a valid token"});
    }
    try{
        const data = jwt.verify(token,process.env.JWT_SECRET_KEY);
        console.log(data);
        req.user=data;
        next();
    }
    catch(err){
        res.status(401).send({error:"Please authenticate using a valid token"});
    }
}

module.exports = fetchUser ; 