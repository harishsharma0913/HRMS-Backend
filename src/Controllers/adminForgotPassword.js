const userModel = require("../Models/userSingUpSchema");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const model = require("../Models/adminLoginSchema");

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (req, res) => {
  const { email } = req.body;  

  try {
    const user = await model.findOne({ email: email });
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

        // Professional Email Content
    const mailOptions = {
      from: `"HRMS Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Your OTP for HRMS Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2F80ED;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your HRMS account.</p>
          <p><strong>Your OTP is:</strong> <span style="font-size: 20px; color: #2F80ED;">${otp}</span></p>
          <p>This OTP will expire in <strong>5 minutes</strong>.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br>
          <p>Thanks,<br><strong>HRMS Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ status: true, message: "OTP sent successfully" });
  } catch (error) {
    console.log("rrrrrrrrrrrrrrrrrrrrrrrrrrrr", error);
    res.status(500).json({ status: false, message: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await model.findOne({ email: email });

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
    const user = await model.findOne({ email: email });

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
