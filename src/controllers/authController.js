import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usermodel from "../models/user.js";
import nodemailer from "nodemailer";






const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                message: "Please fill all fields"
            })
        }
        // check if user already exists
        const alradyuser = await Usermodel.findOne({ email });
        if (alradyuser) {
            return res.status(400).json({
                message: "User already exists"
            })
        }

        // hide the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create the user
        const user = await Usermodel.create({
            name,
            email,
            password: hashedPassword,
            phone
        })

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
            }
        })




    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        })
    }
}



const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            })
        }
        // not alrady user


        const user = await Usermodel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "User Not Found Please Register first"
            })
        }

        // check password
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            return res.status(400).json({
                message: "Invalid Password"
            })
        }

        // generate token


        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        })





    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: error.message
        })
    }
}


const sendForgotOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await Usermodel.findOne({ email });
        if (!user) {
            return res.status(200).json({
                message: "If account exists, OTP sent"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = await bcrypt.hash(otp, 10);
        user.otpExpire = Date.now() + 10 * 60 * 1000;
        user.isOtpVerified = false;
        user.otpLastSentAt = Date.now();
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"ForestGate" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset Password OTP",
            html: `
        <h2>Reset Password</h2>
        <h1>${otp}</h1>
        <p>Valid for 10 minutes</p>
      `
        });

        res.status(200).json({ message: "OTP sent to email" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};




const verifyForgotOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email & OTP required" });
        }

        const user = await Usermodel.findOne({
            email,
            otpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "OTP expired or invalid" });
        }

        const isValid = await bcrypt.compare(otp, user.otp);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        user.isOtpVerified = true;
        await user.save();

        res.status(200).json({
            message: "OTP verified"
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};




const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const user = await Usermodel.findOne({ email });

        if (!user || !user.isOtpVerified) {
            return res.status(403).json({
                message: "OTP verification required"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.otp = undefined;
        user.otpExpire = undefined;
        user.isOtpVerified = false;

        await user.save();

        res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



const resendForgotOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await Usermodel.findOne({ email });
        if (!user) {
            // security reason: same message
            return res.status(200).json({
                message: "If account exists, OTP has been resent"
            });
        }

        // ⏳ Rate limit: 1 OTP per 60 sec
        if (
            user.otpLastSentAt &&
            Date.now() - user.otpLastSentAt < 60 * 1000
        ) {
            return res.status(429).json({
                message: "Please wait before requesting another OTP"
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.otp = await bcrypt.hash(otp, 10);
        user.otpExpire = Date.now() + 10 * 60 * 1000;
        user.otpLastSentAt = Date.now();
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"ForestGate" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Resend OTP - Reset Password",
            html: `
        <h2>Reset Password</h2>
        <p>Your new OTP:</p>
        <h1>${otp}</h1>
        <p>Valid for 10 minutes.</p>
      `
        });

        res.status(200).json({
            message: "OTP resent successfully"
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export default { registerUser, loginUser, sendForgotOtp, verifyForgotOtp, resetPassword, resendForgotOtp }