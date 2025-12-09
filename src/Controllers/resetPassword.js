const userModel = require("../Models/userSingUpSchema");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (req, res) => {
  const { email } = req.body;  

  try {
    const user = await userModel.findOne({ personalEmail: email });
    if (!user) {
      return res.status(404).json({ status: false, message: "Email not found" });
    }

    const otp = generateOTP();

    // Save OTP with expiry (5 minutes)
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    // Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    res.status(200).json({ status: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userModel.findOne({ personalEmail: email });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ status: false, message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ status: false, message: "OTP expired" });
    }

    res.status(200).json({ status: true, message: "OTP verified" });

  } catch (error) {
    res.status(500).json({ status: false, message: "Error verifying OTP" });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await userModel.findOne({ personalEmail: email });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.status(200).json({
      status: true,
      message: "Password reset successful",
    });

  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to reset password" });
  }
};


module.exports = { sendOtp, verifyOtp, resetPassword };
