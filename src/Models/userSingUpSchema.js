const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
   employeeId: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  personalEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  officialEmail: {
    type: String,
    lowercase: true,
  },
  phoneNo: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    required: true,
  },
  doj: {
    type: Date,
    default: Date.now,
  },
  designation: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Designation', 
  required: true,
},
 address: {
   type: String,
   required: true,
  },
  isActive: {
    type: String,
    enum: ['Active', 'InActive'],
    default: 'Active',
  },
status:{
  type: Boolean,
  default:true
},
  documents: {
    profileImage: { type: String },
    aadhar: { type: String },
    pan: { type: String },
    marksheets: {
      ten: { type: String, },
      twel: { type: String },
      ug: { type: String },
      pg: { type: String }, 
    }
  },
  experience: [ {
      companyName: { type: String },
      designation_1: { type: String },
      from: { type: Date },
      to: { type: Date },
    }
   ],

  bankDetails: {
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    branchName: { type: String, required: true }
  },
  token:{
    type:String,
    default:null
  }
},{
  timestamps: true
});

const userModel = mongoose.model('User', employeeSchema);
module.exports = userModel;