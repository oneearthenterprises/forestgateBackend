import jwt from "jsonwebtoken";
import Usermodel from "../models/user.js";

const isAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await Usermodel.findById(decoded.id);

        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Admin access only" });
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export default isAdmin;