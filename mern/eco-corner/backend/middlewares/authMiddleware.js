const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    const token = req.headers.authorization.split(" ")[1]; // Extract token

    if (!token) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
      const user = await User.findById(decoded.id).select("-password"); // Retrieve user without password

      if (!user) {
        return res.status(401).json({ message: "User not found with provided token" });
      }

      req.user = user; // Attach user to the request object
      next(); // Proceed to next middleware
    } catch (error) {
      console.error("Authentication error:", error.message);
      res.status(401).json({ message: "Not authorized, token validation failed" });
    }
  } else {
    res.status(401).json({ message: "Authorization token missing or improperly formatted" });
  }
});


const isAdmin = asyncHandler(async (req, res, next) => {
  console.log(req.user)
  const {email} = req.user;
  const adminUser = await User.findOne({email});
  if(adminUser.role !== "admin"){
    throw new Error('You are not an admin')
  }else{
    next();
  }
});

module.exports = { authMiddleware, isAdmin };
