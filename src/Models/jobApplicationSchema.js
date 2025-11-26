const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema({
  profileAppliedFor: {
    type: String,
    required: [true, "Profile is required"],
    trim: true
  },

  fullName: {
    type: String,
    required: [true, "Full name is required"],
    minlength: [3, "Full name must be at least 3 characters long"],
    maxlength: [50, "Full name cannot exceed 50 characters"],
    trim: true,
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },

  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^\+?[0-9]{7,15}$/, "Invalid phone number"],
    trim: true,
  },

  portfolioLink: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        if (!v) return true; // optional field
        return /^(https?:\/\/)/.test(v);
      },
      message: "Invalid portfolio URL",
    },
  },

  experience: {
    type: String,
    required: [true, "Experience is required"],
    enum: {
      values: ["Fresher", "1-2 years", "2-4 years", "4-6 years", "6+ years"],
      message: "Invalid experience level",
    },
  },

  currentLocation: {
    type: String,
    required: [true, "Current location is required"],
    trim: true,
  },

  motivation: {
    type: String,
    maxlength: [300, "Motivation cannot exceed 300 characters"],
    default: "",
  },

  position: {
    type: String,
    enum: ["Reviewed", "Interview"],
    default: "Reviewed",
  },

  resumeUrl: {
    type: String,
    required: [true, "Resume (PDF) is required"],
    validate: {
      validator: function (v) {
        return v.endsWith(".pdf");
      },
      message: "Resume must be a PDF file",
    },
  },

  appliedFor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobPost",
    required: true,
  },
 },
{ timestamps: true }
);

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
