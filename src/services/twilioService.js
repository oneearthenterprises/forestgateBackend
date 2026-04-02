import twilio from "twilio";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const adminWhatsApp = process.env.ADMIN_WHATSAPP_NUMBER;

let client;

const getTwilioClient = () => {
  if (client) return client;
  if (!accountSid || !authToken || accountSid === "your_account_sid") {
    return null;
  }
  client = twilio(accountSid, authToken);
  return client;
};

const debugLog = (data) => {
    try {
        const logPath = "e:\\forestgate\\forestgateBackend\\twilio-debug.log";
        const entry = `[${new Date().toISOString()}] ${JSON.stringify(data, null, 2)}\n---\n`;
        fs.appendFileSync(logPath, entry);
    } catch (err) {
        console.error("Failed to write debug log:", err);
    }
};

/**
 * Sanitizes and formats a phone number for WhatsApp.
 * Ensures it starts with + and has a country code.
 * @param {String|Number} phone 
 * @returns {String}
 */
const sanitizePhone = (phone) => {
    if (!phone) return "";
    let cleaned = String(phone).replace(/\D/g, ""); // Remove non-digits
    
    // If it starts with 91 and has 12 digits, assume it's already got the country code
    if (cleaned.length === 12 && cleaned.startsWith("91")) {
        return `whatsapp:+${cleaned}`;
    }
    
    // If it has 10 digits, add +91
    if (cleaned.length === 10) {
        return `whatsapp:+91${cleaned}`;
    }
    
    // If it already has a + at the start of the original string, just keep it (but add whatsapp prefix)
    if (String(phone).startsWith("+")) {
        return `whatsapp:${String(phone)}`;
    }

    // Fallback: just return as is with +
    return `whatsapp:+${cleaned}`;
};

/**
 * Helper to get formatted room list
 */
const getRoomListStr = (booking, fallbackRoomName = "Sanctuary Stay") => {
  if (booking.allocation && booking.allocation.length > 0) {
    return booking.allocation.map(r => r.name || booking.bookingType || fallbackRoomName).join(", ");
  }
  return booking.roomName || booking.bookingType || fallbackRoomName;
};

/**
 * Helper to get pricing breakdown string for WhatsApp
 */
const getPricingBreakdownStr = (booking) => {
  const inDate = new Date(booking.checkIn);
  const outDate = new Date(booking.checkOut);
  const nights = Math.max(1, Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24)));
  
  let baseRoomTotal = 0;
  let addonsSum = 0;
  
  if (booking.allocation && booking.allocation.length > 0) {
    baseRoomTotal = booking.allocation.reduce((sum, r) => sum + (Number(r.price) || 0), 0) * nights;
    addonsSum = (booking.addons || []).filter(a => a.status !== "cancelled").reduce((s, a) => s + (Number(a.price) || 0), 0);
  } else if (booking.basePrice) {
    baseRoomTotal = Number(booking.basePrice) * nights;
  }
  
  const subtotal = baseRoomTotal + addonsSum;
  
  // If no allocations/addons, just return total amount logic without breakdown
  if (subtotal === 0) {
     return `*Total Paid:* ₹${Number(booking.totalAmount || 0).toLocaleString()}`;
  }

  const discount = Math.round(subtotal * 0.10);
  const taxes = Math.round((subtotal - discount) * 0.18);
  const finalTotal = booking.totalAmount ? Number(booking.totalAmount) : Math.round(subtotal - discount + taxes);

  let breakdown = `*Pricing Breakdown:*\n`;
  breakdown += `• Base Room Price: ₹${baseRoomTotal.toLocaleString()}\n`;
  if (addonsSum > 0) {
    breakdown += `• Extra Bedding/Services: ₹${addonsSum.toLocaleString()}\n`;
  }
  breakdown += `• 10% Discount: -₹${discount.toLocaleString()}\n`;
  breakdown += `• 18% GST: +₹${taxes.toLocaleString()}\n`;
  breakdown += `*Final Amount:* ₹${finalTotal.toLocaleString()}`;
  
  return breakdown;
};

/**
 * Sends a WhatsApp notification for a new booking.
 * @param {Object} booking - The booking object from database.
 * @param {String} roomName - The name of the room (fallback).
 */
const sendBookingNotification = async (booking, roomName) => {
  try {
    const twilioClient = getTwilioClient();
    if (!twilioClient) {
      console.log(
        "Twilio credentials not configured or using placeholders. Skipping notification.",
      );
      return { sid: "mock_sid", status: "skipped" };
    }

    const roomsStr = getRoomListStr(booking, roomName);

    const message =
      `*New Booking Alert - Forest Gate*\n\n` +
      `*Guest:* ${booking.fullName}\n` +
      `*Rooms:* ${roomsStr}\n` +
      `*Dates:* ${booking.checkIn.toDateString()} - ${booking.checkOut.toDateString()}\n` +
      `*Guests:* ${booking.guests?.adults || 0} Adults, ${booking.guests?.children || 0} Children\n\n` +
      `${getPricingBreakdownStr(booking)}\n\n` +
      `*Phone:* ${booking.phone}\n\n` +
      `Please log in to the admin dashboard to confirm.`;

    debugLog({ method: "sendBookingNotification (Admin)", to: adminWhatsApp, body: message });

    const response = await twilioClient.messages.create({
      body: message,
      from: twilioNumber,
      to: adminWhatsApp,
    });

    console.log(`Twilio notification sent: ${response.sid}`);
    return { sid: response.sid, status: response.status };
  } catch (error) {
    console.error("Twilio Error:", error.message);
    return { error: error.message, status: "failed" };
  }
};

/**
 * Sends a WhatsApp notification to the USER when their booking is confirmed.
 * @param {Object} booking - The booking object.
 */
const sendBookingConfirmationWhatsApp = async (booking) => {
  try {
    const twilioClient = getTwilioClient();
    if (!twilioClient) return { sid: "mock_sid", status: "skipped" };

    const checkInStr = new Date(booking.checkIn).toLocaleDateString();
    const roomsStr = getRoomListStr(booking);
    
    const message =
      `*Booking Confirmed - Forest Gate Sanctuary*\n\n` +
      `Dear ${booking.fullName},\n` +
      `Your booking for *${roomsStr}* has been confirmed!\n\n` +
      `*Dates:* ${checkInStr} - ${new Date(booking.checkOut).toLocaleDateString()}\n\n` +
      `${getPricingBreakdownStr(booking)}\n\n` +
      `*Cancellation Policy:* Full refund only if cancelled 48 hours before check-in.\n\n` +
      `We look forward to seeing you!`;

    debugLog({ method: "sendBookingConfirmationWhatsApp (Guest)", to: sanitizePhone(booking.phone), body: message });

    const response = await twilioClient.messages.create({
      body: message,
      from: twilioNumber,
      to: sanitizePhone(booking.phone),
    });

    return { sid: response.sid, status: response.status };
  } catch (error) {
    console.error("Twilio Confirmation Error:", error.message);
    return { error: error.message, status: "failed" };
  }
};

/**
 * Sends a WhatsApp notification to the GUEST confirming their booking request is received (pending).
 * @param {Object} booking - The booking object.
 */
const sendBookingPendingGuestWhatsApp = async (booking) => {
  try {
    const twilioClient = getTwilioClient();
    if (!twilioClient) return { sid: "mock_sid", status: "skipped" };

    const checkInStr = new Date(booking.checkIn).toLocaleDateString();
    const checkOutStr = new Date(booking.checkOut).toLocaleDateString();
    const roomsStr = getRoomListStr(booking);

    const message =
      `*Booking Request Received - The Forest Gate*\n\n` +
      `Dear ${booking.fullName},\n` +
      `Thank you for choosing The Forest Gate! 🏕️\n\n` +
      `Your booking request for *${roomsStr}* has been received and is currently *pending confirmation* by our team.\n\n` +
      `*Dates:* ${checkInStr} – ${checkOutStr}\n` +
      `*Guests:* ${booking.guests?.adults || 0} Adults, ${booking.guests?.children || 0} Children\n\n` +
      `${getPricingBreakdownStr(booking)}\n\n` +
      `You will receive a confirmation message once our team approves your booking. We'll be in touch shortly! 🙏`;

    debugLog({ method: "sendBookingPendingGuestWhatsApp (Guest)", to: sanitizePhone(booking.phone), body: message });

    const response = await twilioClient.messages.create({
      body: message,
      from: twilioNumber,
      to: sanitizePhone(booking.phone),
    });

    console.log(`Guest pending WhatsApp sent: ${response.sid}`);
    return { sid: response.sid, status: response.status };
  } catch (error) {
    console.error("Twilio Guest Pending Error:", error.message);
    return { error: error.message, status: "failed" };
  }
};

/**
 * Sends a WhatsApp notification to the GUEST when their payment is received.
 * @param {Object} booking - The booking object.
 */
const sendPaymentConfirmationWhatsApp = async (booking) => {
  try {
    const twilioClient = getTwilioClient();
    if (!twilioClient) return { sid: "mock_sid", status: "skipped" };

    const message =
      `*Payment Received - Forest Gate Sanctuary*\n\n` +
      `Dear ${booking.fullName},\n` +
      `Thank you! We have successfully received your payment for booking *${booking.bookingId || booking._id}*.\n\n` +
      `${getPricingBreakdownStr(booking)}\n\n` +
      `*Current Status:* Paid ✅\n\n` +
      `*Cancellation Policy:* Full refund only if cancelled 48 hours before check-in.\n\n` +
      `Thanks for paying, you are always welcome! 🙏\n\n` +
      `You can view and download your invoice from your dashboard at any time. We look forward to hosting you soon!`;

    const response = await twilioClient.messages.create({
      body: message,
      from: twilioNumber,
      to: sanitizePhone(booking.phone),
    });

    console.log(`Payment WhatsApp notification sent: ${response.sid}`);
    return { sid: response.sid, status: response.status };
  } catch (error) {
    console.error("Twilio Payment Confirmation Error:", error.message);
    return { error: error.message, status: "failed" };
  }
};

/**
 * Sends a WhatsApp notification to the GUEST when their booking is cancelled.
 * @param {Object} booking - The booking object.
 */
const sendCancellationGuestWhatsApp = async (booking) => {
  try {
    const twilioClient = getTwilioClient();
    if (!twilioClient) return { sid: "mock_sid", status: "skipped" };

    const checkInStr = new Date(booking.checkIn).toLocaleDateString();
    const roomsStr = getRoomListStr(booking);
    const reasons =
      booking.cancellationReasons?.length > 0
        ? booking.cancellationReasons.join(", ")
        : "Not specified";

    const message =
      `*Booking Cancelled - The Forest Gate*\n\n` +
      `Dear ${booking.fullName},\n` +
      `Your booking for *${roomsStr}* has been *cancelled*.\n\n` +
      `*Dates:* ${checkInStr} - ${new Date(booking.checkOut).toLocaleDateString()}\n` +
      `*Reason:* ${reasons}\n` +
      (booking.cancellationNote
        ? `*Note:* ${booking.cancellationNote}\n\n`
        : `\n`) +
      `If you have any questions, please contact us. We hope to welcome you at The Forest Gate in the future. 🙏`;

    const response = await twilioClient.messages.create({
      body: message,
      from: twilioNumber,
      to: sanitizePhone(booking.phone),
    });

    console.log(`Guest cancellation WhatsApp sent: ${response.sid}`);
    return { sid: response.sid, status: response.status };
  } catch (error) {
    console.error("Twilio Guest Cancellation Error:", error.message);
    return { error: error.message, status: "failed" };
  }
};

export default {
  sendBookingNotification,
  sendBookingConfirmationWhatsApp,
  sendBookingPendingGuestWhatsApp,
  sendCancellationGuestWhatsApp,
  sendPaymentConfirmationWhatsApp,
};
