import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usermodel from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import nodemailer from "nodemailer";
import Booking from "../models/booking.js";
import {
  sendForgotOtpEmail,
  sendResetSuccessEmail,
  verifyOtpRegisterOtp,
} from "../services/emailService.js";
import dotenv from "dotenv";
dotenv.config();

// admin routes

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    // Static admin credentials check
    const isAdminEmail = email === "adminforestgate@gmail.com";
    const isAdminPassword = password === "adminforestgate";

    if (!isAdminEmail || !isAdminPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT for static admin
    const token = jwt.sign(
      { id: "static-admin-id", role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Admin logged in successfully",
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const verifyOtpRegister = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP required",
      });
    }

    const user = await Usermodel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (user.otpExpire < new Date()) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    user.isOtpVerified = true;
    user.otp = "";
    user.otpExpire = null;

    await user.save();

    res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, rememberMe } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const existingUser = await Usermodel.findOne({ email });

    if (existingUser) {
      if (!existingUser.isOtpVerified) {
        return res.status(409).json({
          message: "OTP verification pending. Please verify your email.",
        });
      }

      return res.status(409).json({
        message: "You already exist",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const timestampPart = Date.now().toString().slice(-4);
    const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
    const userId = `FG-USER-${timestampPart}${randomPart}`;

    const user = await Usermodel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      rememberMe,
      otp,
      otpExpire: Date.now() + 10 * 60 * 1000,
      isOtpVerified: false,
      userId,
    });

    await verifyOtpRegisterOtp(email, otp);

    return res.status(201).json({
      message: "User registered successfully. OTP sent.",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }
    // not alrady user

    const user = await Usermodel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User Not Found Please Register first",
      });
    }

    // check password
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }

    // generate token

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const sendForgotOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await Usermodel.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message: "If account exists, OTP sent",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    user.isOtpVerified = false;
    user.otpLastSentAt = Date.now();
    await user.save();

    await sendForgotOtpEmail(email, otp);

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
      otpExpire: { $gt: Date.now() },
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
      message: "OTP verified",
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
        message: "OTP verification required",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpire = undefined;
    user.isOtpVerified = false;

    await user.save();

    await sendResetSuccessEmail(email);

    res.status(200).json({
      message: "Password reset successfully",
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
        message: "If account exists, OTP has been resent",
      });
    }

    // ⏳ Rate limit: 1 OTP per 60 sec
    if (user.otpLastSentAt && Date.now() - user.otpLastSentAt < 60 * 1000) {
      return res.status(429).json({
        message: "Please wait before requesting another OTP",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = await bcrypt.hash(otp, 10);
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    user.otpLastSentAt = Date.now();
    await user.save();

    const transporter = nodemailer.createTransport({
      host: "mail.forestgatetrails.com",
      port: 465,
      secure: true,
      auth: {
        user: "admin@forestgatetrails.com",
        pass: process.env.EMAIL_PASS,
      },
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
      `,
    });

    res.status(200).json({
      message: "OTP resent successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Prevent password update through this endpoint for safety
    delete updateData.password;

    const user = await Usermodel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Usermodel.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Usermodel.countDocuments();
    const users = await Usermodel.find({}, { password: 0 }).sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(limit)
    .lean();

    // Fetch booking counts and arrays for each user
    const usersWithBookingData = await Promise.all(users.map(async (user) => {
        const userBookings = await Booking.find({ email: user.email }, { bookingId: 1, _id: 1 }).lean();
        const count = userBookings.length;
        const bookingIds = userBookings.map(b => b.bookingId || b._id.toString());
        return { ...user, bookingCount: count, bookingIds };
    }));

    return res.status(200).json({
      message: "Users fetched successfully",
      total,
      page,
      totalPages: Math.ceil(total / limit),
      users: usersWithBookingData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    // User is already attached to req by authMiddleware
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = { ...req.body };
    updateData.corporatePartyOptions =
      req.body.corporatePartyOptions === "true";
    // Handle image upload if a file is present
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "profile_images",
          resource_type: "auto",
        });
        updateData.profileImage = result.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res
          .status(500)
          .json({ message: "Failed to upload image to Cloudinary" });
      }
    }

    // Security: Do not allow password or role updates here
    delete updateData.password;
    delete updateData.role;

    const updatedUser = await Usermodel.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  registerUser,
  loginUser,
  sendForgotOtp,
  verifyForgotOtp,
  resetPassword,
  resendForgotOtp,
  logoutUser,
  adminLogin,
  getAllUsers,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  verifyOtpRegister,
};
