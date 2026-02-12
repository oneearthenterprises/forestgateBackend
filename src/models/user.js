import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    otp: String,
    otpExpire: Date,
    isOtpVerified: {
        type: Boolean,
        default: false
    },
    otpLastSentAt: Date
}, {
    timestamps: true
});


export default mongoose.model("Usermodel", userSchema);