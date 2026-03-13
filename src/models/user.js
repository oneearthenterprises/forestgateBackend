import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    otp: String,
    otpExpire: Date,
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    rememberMe: {
      type: Boolean,
      default: false,
    },
    otpLastSentAt: Date,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Usermodel", userSchema);
