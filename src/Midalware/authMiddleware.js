const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({status: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({status: false, message: "Invalid token" });
  }
};

const isEmployee = (req, res, next) => {
  if (req.user.role !== "employee") {
    return res.status(403).json({status: false, message: "Access denied: Employees only" });
  }
  next();
};

module.exports = { verifyToken, isEmployee };
