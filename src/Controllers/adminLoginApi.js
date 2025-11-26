const model = require("../Models/adminLoginSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  // const pass = "1234567890";
  //   const converHashPass = (pass)=>{
  //     const convertPass = bcrypt.hashSync(pass,10)
  //     console.log(convertPass);
  //   }
  //   converHashPass(pass);

  try {
    const findData = await model.findOne({ email });
    if (!findData) {
     return res.status(400).send({status: false, message: "User not exits" });
    }
    const compPass = await bcrypt.compare(password, findData.password);

    if (!compPass) {
     return res.status(400).send({status: false, message: "Password not match" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {expiresIn: "24h"});

    const upadateUser = await model.findByIdAndUpdate(findData._id, {
      token: token,
    });
     res.status(200).send({ status: true, message: "Login Successfully",token:token });
  } catch (error) {
     res.status(500).send({ status: false, message: "Internal Server Error", error: error.message });
  }
};

const adminLogout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ status: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ status: false, message: "Invalid token" });
      }

      const email = decoded.email;

      await model.findOneAndUpdate({ email }, { token: null });

      res.status(200).json({ status: true, message: "Logged out successfully" });
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Logout failed", error: error.message });
  }
};

module.exports = { loginAdmin, adminLogout };
