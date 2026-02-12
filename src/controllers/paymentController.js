import razorpay from "../config/razorpay.js";
import Booking from "../models/booking.js";
import crypto from "crypto";

// CREATE RAZORPAY ORDER
export const createOrder = async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const order = await razorpay.orders.create({
            amount: booking.totalAmount * 100, // ₹ → paise
            currency: "INR",
            receipt: `booking_${booking._id}`,
        });

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
    try {
        const {
            bookingId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Invalid payment" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        booking.status = "confirmed";
        booking.paymentId = razorpay_payment_id;

        await booking.save();

        res.status(200).json({
            message: "Payment successful & booking confirmed",
            booking,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
