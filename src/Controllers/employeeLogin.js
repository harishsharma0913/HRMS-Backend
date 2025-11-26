const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../Models/userSingUpSchema");

const employeeLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const employee = await userModel.findOne({ personalEmail: email });
    if (!employee) {
      return res.status(404).json({ status: false, message: "Employee not found" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ status: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: employee._id,
        email: employee.personalEmail,
        role: "employee",
      },
      process.env.JWT_USER_SECRET,
      { expiresIn: "1d" }
    );

    await userModel.findByIdAndUpdate(employee._id, { token });

    res.status(200).json({
      status: true,
      message: "Login successful",
      token,
      employee: {
        id: employee._id,
        fullName: employee.fullName,
        personalEmail: employee.personalEmail,
        department: employee.department,
        designation: employee.designation,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  const { id } = req.body;
  try {
    await userModel.findByIdAndUpdate(id, { token: null });
    res.status(200).json({ status: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: "Logout failed" });
  }
};

module.exports = { employeeLogin, logout };
