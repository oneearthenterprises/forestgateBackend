import mongoose from "mongoose";
import Booking from "../models/booking.js";
import RoomLists from "../models/room.js";
import Usermodel from "../models/user.js";
import twilioService from "../services/twilioService.js";
import twilio from "twilio";
import { 
    sendBookingReceivedEmail, 
    sendBookingCancelledEmail, 
    sendBookingConfirmationEmail,
    sendPaymentConfirmationToUser,
    sendPaymentConfirmationToAdmin
} from "../services/emailService.js";

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
            guestDetails,
            specialRequest,
            notes,
            addons,
            mattressRequired,
            extraBedRequired,
            allocation,
            totalRooms,
            recaptchaToken,
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

        // 🔹 Handle Manual Room Selection (Admin)
        let room;
        let finalRoomName = "";
        let finalPricePerNight = 0;

        if (roomId === "manual") {
            finalRoomName = req.body.roomName || "Manual Entry Room";
            finalPricePerNight = req.body.pricePerNight || 0;
        } else {
            // 🔹 Validate roomId
            if (!mongoose.Types.ObjectId.isValid(roomId)) {
                return res.status(400).json({ message: "Invalid room id" });
            }

            room = await RoomLists.findById(roomId);
            if (!room) {
                return res.status(404).json({ message: "Room not found" });
            }
            finalRoomName = room.roomName;
            finalPricePerNight = room.pricePerNight;
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

        // Generate unique booking ID
        const timestampPart = Date.now().toString().slice(-4);
        const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
        const bookingIdValue = `FOREST-${timestampPart}${randomPart}`;

        // 🔥 SERVER decides amount (or uses manual price)
        let basePrice = totalNights * finalPricePerNight;
        if (allocation && allocation.length > 0) {
            // allocation[].price is price-per-night per room (set by frontend)
            const allocationSum = allocation.reduce((sum, r) => sum + (Number(r.price) || 0), 0);
            basePrice = totalNights * allocationSum;
        }
        
        const finalAddons = addons || [];
        const addonsPrice = finalAddons.reduce((sum, addon) => {
            if (addon.status === "cancelled") return sum;
            return sum + (Number(addon.price) || 0);
        }, 0);

        // Apply same pricing as frontend: 10% discount + 18% GST on room base, then add addons
        const discountedBase = basePrice * 0.90;       // 10% discount
        const baseWithGst = discountedBase * 1.18;     // 18% GST
        const totalAmount = Math.round(baseWithGst + addonsPrice);

        const booking = await Booking.create({
            bookingId: bookingIdValue,
            room: roomId === "manual" ? null : roomId,
            roomName: finalRoomName,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: {
                adults,
                children: children || 0,
            },
            guestDetails: guestDetails || [],
            fullName,
            email,
            phone,
            specialRequest: specialRequest || "",
            notes: notes || "",
            pricePerNight: finalPricePerNight,
            totalNights,
            totalAmount,
            addons: finalAddons,
            mattressRequired: mattressRequired || false,
            extraBedRequired: extraBedRequired || false,
            allocation: allocation || [],
            totalRooms: totalRooms || 1,
            status: "pending",
        });

        // 🚀 Send Twilio Notification
        const twilioResult = await twilioService.sendBookingNotification(booking, finalRoomName);
        
        if (twilioResult.sid) {
            booking.twilioMessageSid = twilioResult.sid;
            booking.notificationStatus = twilioResult.status;
            await booking.save();
        }

        // 🚀 Send Twilio Request Received Notification to Guest
        await twilioService.sendBookingPendingGuestWhatsApp(booking);

        // 📧 Send Booking Received Email to Guest
        sendBookingReceivedEmail(booking);

        // 🚀 Sync to User Profile (Admin View) - Create if not exists (Guest)
        await Usermodel.findOneAndUpdate(
            { email },
            {
                $set: {
                    // Separate booking contact info from account registration
                    bookingName: fullName,
                    bookingEmail: email,
                    bookingPhone: phone,
                    
                    bookingPersonName: fullName, // Legacy compatibility
                    totalAdults: adults,
                    totalChildren: children || 0,
                    totalMembers: parseInt(adults) + (parseInt(children) || 0),
                    travelDate: checkInDate.toISOString().split('T')[0],
                    returnDate: checkOutDate.toISOString().split('T')[0],
                    bookingStatus: "Pending",
                    specialRequest: specialRequest || "",
                    notes: notes || ""
                },
                $setOnInsert: {
                    // Only set these during initial guest creation, don't overwrite registered user info
                    name: fullName,
                    phone: parseInt(phone.replace(/\D/g, '')) || 0,
                    password: "guest_user_password_placeholder", // Since password is required
                    role: "user"
                }
            },
            { upsert: true, new: true }
        );

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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Booking.countDocuments();
        const bookings = await Booking.find()
            .populate("room")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            total,
            page,
            totalPages: Math.ceil(total / limit),
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
        const { cancellationReasons, cancellationNote } = req.body;

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

        if (cancellationReasons && Array.isArray(cancellationReasons)) {
            booking.cancellationReasons = cancellationReasons;
        }

        if (cancellationNote) {
            booking.cancellationNote = cancellationNote;
        }
        
        booking.cancelledAt = new Date();

        await booking.save();

        // 🚀 Send WhatsApp Notification for cancellation to Guest

        // 🚀 Send WhatsApp Notification for cancellation to Guest
        await twilioService.sendCancellationGuestWhatsApp(booking);

        // 📧 Send Booking Cancelled Email to Guest
        sendBookingCancelledEmail(booking);

        // Sync to User profile
        const userToUpdate = await Usermodel.findOne({ 
            email: { $regex: new RegExp(`^${booking.email}$`, 'i') } 
        });
        if (userToUpdate) {
            userToUpdate.bookingStatus = "Cancelled";
            await userToUpdate.save();
        }

        res.status(200).json({
            message: "Booking cancelled successfully",
            booking,
        });
    } catch (error) {
        console.error("Booking cancellation error:", error);
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   UPDATE BOOKING STATUS (ADMIN)
========================= */

const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        let { status } = req.body;

        if (status) {
            status = status.toLowerCase();
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid booking id" });
        }

        const validStatuses = ["pending", "confirmed", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const oldBooking = await Booking.findById(id);
        if (!oldBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (booking) {
            // 🚀 If status changed to confirmed or cancelled, send notifications
            if (oldBooking.status !== "confirmed" && status === "confirmed") {
                sendBookingConfirmationEmail(booking);
                await twilioService.sendBookingConfirmationWhatsApp(booking);
            } else if (oldBooking.status !== "cancelled" && status === "cancelled") {
                sendBookingCancelledEmail(booking);
                await twilioService.sendCancellationGuestWhatsApp(booking);
            }

            // Sync status to User profile
            const userToUpdate = await Usermodel.findOne({ email: booking.email });
            if (userToUpdate) {
                userToUpdate.bookingStatus = status.charAt(0).toUpperCase() + status.slice(1);
                await userToUpdate.save();
            }
        }

        res.status(200).json({
            message: "Booking status updated successfully",
            booking,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   GET USER HISTORY (ADMIN/USER)
========================= */
const getUserHistory = async (req, res) => {
    try {
        const { email } = req.params;
        const bookings = await Booking.find({ 
            email: { $regex: new RegExp(`^${email}$`, 'i') } 
        })
        .populate("room")
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: bookings.length,
            bookings,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   UPDATE BOOKING (ADMIN)
========================= */
const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.status) {
            updateData.status = updateData.status.toLowerCase();
        }

        const oldBooking = await Booking.findById(id);
        if (!oldBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // 🔹 Recalculate totalAmount if dates, price, or addons change
        let totalAmount = oldBooking.totalAmount;
        let totalNights = oldBooking.totalNights;
        
        const newCheckIn = updateData.checkIn ? new Date(updateData.checkIn) : oldBooking.checkIn;
        const newCheckOut = updateData.checkOut ? new Date(updateData.checkOut) : oldBooking.checkOut;
        const newPricePerNight = updateData.pricePerNight !== undefined ? updateData.pricePerNight : oldBooking.pricePerNight;
        const finalAddons = updateData.addons || oldBooking.addons || [];

        if (updateData.checkIn || updateData.checkOut) {
            totalNights = Math.ceil((new Date(newCheckOut) - new Date(newCheckIn)) / (1000 * 60 * 60 * 24));
            if (totalNights < 0) totalNights = 0;
            updateData.totalNights = totalNights;
        }

        let basePrice = totalNights * newPricePerNight;
        const currentAllocation = updateData.allocation || oldBooking.allocation || [];
        if (currentAllocation && currentAllocation.length > 0) {
            const allocationSum = currentAllocation.reduce((sum, r) => sum + (Number(r.price) || 0), 0);
            basePrice = totalNights * allocationSum;
        }
        const addonsPrice = finalAddons.reduce((sum, addon) => {
            if (addon.status === "cancelled") return sum;
            return sum + (Number(addon.price) || 0);
        }, 0);
        updateData.totalAmount = basePrice + addonsPrice;

        const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // 🚀 If status changed to confirmed or cancelled, send notifications
        if (updateData.status === "confirmed" && oldBooking.status !== "confirmed") {
            sendBookingConfirmationEmail(booking);
            await twilioService.sendBookingConfirmationWhatsApp(booking);
        } else if (updateData.status === "cancelled" && oldBooking.status !== "cancelled") {
            sendBookingCancelledEmail(booking);
            await twilioService.sendCancellationGuestWhatsApp(booking);
        }

        // 🚀 If paymentStatus changed to Paid, send notifications
        if (updateData.paymentStatus === "Paid" && oldBooking.paymentStatus !== "Paid") {
            sendPaymentConfirmationToUser(booking);
            sendPaymentConfirmationToAdmin(booking);
            await twilioService.sendPaymentConfirmationWhatsApp(booking);
        }

        // 🚀 Sync vital info to User Profile (Syncing only to Booking Profile, not Account)
        const userToUpdate = await Usermodel.findOne({ email: booking.email });
        if (userToUpdate) {
            // Update booking status and dates
            if (updateData.status) {
                userToUpdate.bookingStatus = updateData.status.charAt(0).toUpperCase() + updateData.status.slice(1);
            }
            if (updateData.checkIn) {
                userToUpdate.travelDate = new Date(updateData.checkIn).toISOString().split('T')[0];
            }
            if (updateData.checkOut) {
                userToUpdate.returnDate = new Date(updateData.checkOut).toISOString().split('T')[0];
            }
            
            // Sync booking contact info to user's booking profile
            if (updateData.fullName) userToUpdate.bookingName = updateData.fullName;
            if (updateData.email) userToUpdate.bookingEmail = updateData.email;
            if (updateData.phone) userToUpdate.bookingPhone = updateData.phone;

            await userToUpdate.save();
        }

        res.status(200).json({
            success: true,
            message: "Booking updated successfully",
            booking,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   DELETE BOOKING (ADMIN)
========================= */
const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid booking id" });
        }

        const booking = await Booking.findByIdAndDelete(id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({
            success: true,
            message: "Booking deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* =========================
   HANDLE TWILIO WEBHOOK (INBOUND)
========================= */
const handleTwilioWebhook = async (req, res) => {
    try {
        const { From, Body } = req.body;
        
        if (!From || !Body) {
            return res.status(400).send("Missing From or Body");
        }

        const phone = From.replace("whatsapp:", "");
        const cleanedPhone = phone.startsWith('+91') ? phone.replace('+91', '') : phone;
        const phoneVariations = [
            phone, 
            cleanedPhone, 
            '+91' + cleanedPhone,
            '0' + cleanedPhone
        ];

        // Find the most recent booking associated with this number
        const booking = await Booking.findOne({
            phone: { $in: phoneVariations }
        }).sort({ createdAt: -1 });

        const twiml = new twilio.twiml.MessagingResponse();

        if (!booking) {
            twiml.message("Sorry, we couldn't find a recent booking associated with this number.");
            res.type('text/xml').send(twiml.toString());
            return;
        }

        const action = Body.trim().toLowerCase();
        const oldStatus = booking.status;
        
        if (action === "confirm") {
            if (oldStatus !== "confirmed") {
                booking.status = "confirmed";
                await booking.save();
                sendBookingConfirmationEmail(booking);
                
                // Sync to User profile
                const userToUpdate = await Usermodel.findOne({ email: booking.email });
                if (userToUpdate) {
                    userToUpdate.bookingStatus = "Confirmed";
                    await userToUpdate.save();
                }
            }
            twiml.message(`Thank you! Your booking for ${booking.roomName || 'Sanctuary Stay'} has been confirmed.`);
        } else if (action === "cancel") {
            if (oldStatus !== "cancelled") {
                booking.status = "cancelled";
                booking.cancelledAt = new Date();
                await booking.save();
                sendBookingCancelledEmail(booking);
                
                // Sync to User profile
                const userToUpdate = await Usermodel.findOne({ email: booking.email });
                if (userToUpdate) {
                    userToUpdate.bookingStatus = "Cancelled";
                    await userToUpdate.save();
                }
            }
            twiml.message("Your booking has been cancelled. We hope to see you another time!");
        } else {
            twiml.message("Invalid response. Please reply with Confirm or Cancel.");
            res.type('text/xml').send(twiml.toString());
            return;
        }

        res.type('text/xml').send(twiml.toString());

    } catch (error) {
        console.error("Twilio Webhook error:", error);
        res.status(500).send("Internal Server Error");
    }
};

/* =========================
   GET ROOM AVAILABILITY
======================== */
const getRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(roomId)) {
            return res.status(400).json({ message: "Invalid room id" });
        }

        // Fetch all non-cancelled bookings for this room
        const bookings = await Booking.find({
            room: roomId,
            status: { $ne: "cancelled" }
        }).select("checkIn checkOut");

        res.status(200).json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error("Error fetching room availability:", error);
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
    getUserHistory,
    cancelBooking,
    updateBookingStatus,
    updateBooking,
    deleteBooking,
    handleTwilioWebhook,
    getRoomAvailability
};
