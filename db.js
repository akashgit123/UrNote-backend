const mongoose = require('mongoose');
require('dotenv').config();

const dbUri = process.env.MONGODB_URI;
const connectionParams={
    useNewUrlParser: true, 
    useUnifiedTopology: true 
}

const connectToDb = async() =>{
    mongoose.connect(dbUri,connectionParams)
    .then(() => console.log('Connected!'))
    .catch((err)=>{
        console.log("Connection error :",err) 
    })
}

module.exports = connectToDb;