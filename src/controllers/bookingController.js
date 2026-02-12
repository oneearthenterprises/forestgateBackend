import mongoose from "mongoose";
import Booking from "../models/booking.js";
import RoomLists from "../models/room.js";

/* =========================
   CREATE BOOKING
========================= */
const createBooking = async (req, res) => {
    try {
        const {
            roomId,
            checkIn,
            checkOut,
            adults,
            children,
            fullName,
            email,
            phone,
        } = req.body;

        // 🔹 Basic validation
        if (
            !roomId ||
            !checkIn ||
            !checkOut ||
            !adults ||
            !fullName ||
            !email ||
            !phone
        ) {
            return res
                .status(400)
                .json({ message: "Please fill all required fields" });
        }

        // 🔹 Validate roomId
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
            return res.status(400).json({ message: "Invalid room id" });
        }

        const room = await RoomLists.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // 🔹 Calculate nights
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        const totalNights = Math.ceil(
            (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
        );

        if (totalNights <= 0) {
            return res.status(400).json({ message: "Invalid date selection" });
        }

        // 🔥 SERVER decides amount
        const totalAmount = totalNights * room.pricePerNight;

        const booking = await Booking.create({
            room: roomId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: {
                adults,
                children: children || 0,
            },
            fullName,
            email,
            phone,
            pricePerNight: room.pricePerNight,
            totalNights,
            totalAmount,
            status: "pending",
        });

        res.status(201).json({
            message: "Booking created successfully",
            booking,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   GET ALL BOOKINGS (ADMIN)
========================= */
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("room")
            .sort({ createdAt: -1 });

        res.status(200).json({
            total: bookings.length,
            bookings,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   GET SINGLE BOOKING
========================= */
const getSingleBooking = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid booking id" });
        }

        const booking = await Booking.findById(id).populate("room");

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/* =========================
   CANCEL BOOKING
========================= */
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid booking id" });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.status === "cancelled") {
            return res
                .status(400)
                .json({ message: "Booking already cancelled" });
        }

        booking.status = "cancelled";
        await booking.save();

        res.status(200).json({
            message: "Booking cancelled successfully",
            booking,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   EXPORT
========================= */
export default {
    createBooking,
    getAllBookings,
    getSingleBooking,
    cancelBooking,
};
