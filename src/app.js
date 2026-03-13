import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import newsletterRoutes from "./routes/NewslatterRouts.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/Auth/api", authRoutes);
app.use("/Rooms/api", roomRoutes);
app.use("/Contact/api", contactRoutes);
app.use("/Booking/api", bookingRoutes);
app.use("/Payment/api", paymentRoutes);
app.use("/api/admin", adminRoutes);

// newslatter api
app.use("/api/newsletter", newsletterRoutes);

// profile api pending

export default app;
