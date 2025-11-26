const mongoose = require('mongoose');

const JobPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },

      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true
      },

    location: {
      type: String,
      required: true,
    },

    salary: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
      minlength: 20,
    },
    
   experience: {
      type: String,
      enum: ["Fresher", "1-3 years", "3-5 years", "5+ years"],
      default: "Fresher",
    },

    applications: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const JobPost = mongoose.model("JobPost", JobPostSchema);

module.exports = JobPost;