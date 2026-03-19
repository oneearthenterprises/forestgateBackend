import express from "express";
import bookingController from "../controllers/bookingController.js";

const router = express.Router();

router.post("/create-booking", bookingController.createBooking);
router.post("/twilio-webhook", bookingController.handleTwilioWebhook);
router.get("/bookings", bookingController.getAllBookings);
router.get("/booking/:id", bookingController.getSingleBooking);

router.put("/cancel-booking/:id", bookingController.cancelBooking);
router.put("/update-status/:id", bookingController.updateBookingStatus);
router.put("/update-booking/:id", bookingController.updateBooking);
router.delete("/delete-booking/:id", bookingController.deleteBooking);
router.get("/user-history/:email", bookingController.getUserHistory);
router.get("/room-availability/:roomId", bookingController.getRoomAvailability);

export default router;
