import express from "express";
import bookingController from "../controllers/bookingController.js";

const router = express.Router();

router.post("/create-booking", bookingController.createBooking);
router.get("/bookings", bookingController.getAllBookings);
router.get("/booking/:id", bookingController.getSingleBooking);

router.put("/cancel-booking/:id", bookingController.cancelBooking);
export default router;
