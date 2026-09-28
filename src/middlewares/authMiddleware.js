import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Usermodel from "../models/user.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Support static admin login token
    if (decoded.id === "static-admin-id" || decoded.role === "admin") {
      req.user = {
        _id: "static-admin-id",
        email: process.env.ADMINDASHBORDEMAIL || "support@forestgatetrails.com",
        name: "Admin",
        role: "admin",
      };
      return next();
    }

    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ message: "Invalid token user ID" });
    }

    const user = await Usermodel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ message: "Unauthorized access" });
  }
};

export default authMiddleware;
