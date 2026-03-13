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
    childrenName: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    age: {
      type: Number,
      default: null,
    },
    address: {
      type: String,
      default: "",
    },
    alternatePhone: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    customFields: {
      type: Map,
      of: String,
      default: {},
    },
    // Booking Information
    bookingPersonName: {
      type: String,
      default: "",
    },
    totalAdults: {
      type: Number,
      default: 0,
    },
    totalChildren: {
      type: Number,
      default: 0,
    },
    childrenNames: {
      type: String,
      default: "",
    },
    totalMembers: {
      type: Number,
      default: 0,
    },
    travelDate: {
      type: String,
      default: "",
    },
    returnDate: {
      type: String,
      default: "",
    },
    destination: {
      type: String,
      default: "",
    },
    pickupLocation: {
      type: String,
      default: "",
    },
    bookingStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", ""],
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid", "Partial", ""],
      default: "",
    },
    specialRequest: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    dob: {
      type: String,
      default: "",
    },
    anniversaryDate: {
      type: String,
      default: "",
    },
    occupation: {
      type: String,
      enum: ["Business Owner", "Salaried", ""],
      default: "",
    },
    companyName: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Usermodel", userSchema);
