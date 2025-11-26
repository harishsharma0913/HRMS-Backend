const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // assuming User model for employees
    required: true,
  },
  annualLeave: {
    type: Number,
    default: 20, 
  },
  leaveType: {
    type: String,
    enum: ["Casual Leave", "Sick Leave", "Earned Leave", "Unpaid Leave"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: String,
    enum: ["Half Day", "Full Day"],
    default: "Full Day",
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Cancelled"],
    default: "Pending",
  },
   comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // kisne comment kiya
        text: { type: String, required: true }, // comment ka text
        createdAt: { type: Date, default: Date.now },
      },
    ],
},
{ timestamps: true });

module.exports = mongoose.model("Leave", leaveSchema);
