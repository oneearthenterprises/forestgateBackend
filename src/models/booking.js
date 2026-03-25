import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      sparse: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomLists",
      required: false,
    },

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    guests: {
      adults: { type: Number, required: true },
      children: { type: Number, default: 0 },
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    pricePerNight: {
      type: Number,
      required: true,
    },

    totalNights: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid", "Partially Paid"],
      default: "Unpaid",
    },

    cancellationReasons: {
      type: [String],
      default: [],
    },

    cancellationNote: {
      type: String,
      default: "",
    },

    cancelledAt: {
      type: Date,
    },
    twilioMessageSid: {
      type: String,
      default: "",
    },
    notificationStatus: {
      type: String,
      default: "none",
    },
    mattressRequired: {
      type: Boolean,
      default: false,
    },
    extraBedRequired: {
      type: Boolean,
      default: false,
    },
    totalRooms: {
      type: Number,
      default: 1,
    },
    allocation: [
      {
        name: String,
        adults: Number,
        children: Number,
        extraBedding: Boolean,
        price: Number,
      }
    ],
    roomName: {
      type: String,
      default: "",
    },
    guestDetails: [
      {
        name: String,
        gender: String,
        age: String,
        type: { type: String, default: "adult" },
        assignedRoom: { type: String, default: "" }
      }
    ],
    notes: {
      type: String,
      default: "",
    },
    specialRequest: {
      type: String,
      default: "",
    },
    customFields: [
      {
        key: { type: String, default: "" },
        value: { type: String, default: "" }
      }
    ],
    addons: [
      {
        name: { type: String, default: "" },
        price: { type: Number, default: 0 },
        status: { type: String, default: "active" } // "active" or "cancelled"
      }
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Booking", bookingSchema);
