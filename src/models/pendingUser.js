import mongoose from "mongoose";

// Stores registration data temporarily until OTP is verified.
// Auto-expires after 15 minutes via MongoDB TTL index.
const pendingUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // already hashed
  phone: { type: Number, required: true },
  rememberMe: { type: Boolean, default: false },
  otp: { type: String, required: true },
  otpExpire: { type: Date, required: true },
  otpLastSentAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now, expires: 900 }, // TTL: 15 min
});

export default mongoose.model("PendingUser", pendingUserSchema);
