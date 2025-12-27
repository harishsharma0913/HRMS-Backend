const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    email:{
        type: String,
        requied:true,
        unique:true
    },
    password:{
        type: String,
        requied:true
    },
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    token:{
        type:String,
        default: null
    }
})


const model = mongoose.model("admin",schema);
module.exports = model;