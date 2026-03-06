import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Usermodel from "./src/models/user.js";

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const existingAdmin = await Usermodel.findOne({ email: "admin@gmail.com" });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash("admin123", 10);

        await Usermodel.create({
            name: "Admin",
            email: "admin@gmail.com",
            password: hashedPassword,
            phone: "9999999999",
            role: "admin"
        });

        console.log("Admin created successfully");
        process.exit();

    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

createAdmin();