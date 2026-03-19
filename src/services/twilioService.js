import twilio from "twilio";
import dotenv from "dotenv";
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

/**
 * Sends a WhatsApp notification for a new booking.
 * @param {Object} booking - The booking object from database.
 * @param {String} roomName - The name of the room.
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

    const message =
      `*New Booking Alert - Forest Gate*\n\n` +
      `*Guest:* ${booking.fullName}\n` +
      `*Room:* ${roomName}\n` +
      `*Dates:* ${booking.checkIn.toDateString()} - ${booking.checkOut.toDateString()}\n` +
      `*Guests:* ${booking.guests.adults} Adults, ${booking.guests.children} Children\n` +
      `*Total:* ₹${booking.totalAmount.toLocaleString()}\n` +
      `*Phone:* ${booking.phone}\n\n` +
      `Please log in to the admin dashboard to confirm.`;

    const response = await twilioClient.messages.create({
      body: message,
      from: twilioNumber, // e.g., 'whatsapp:+14155238886'
      to: adminWhatsApp, // e.g., 'whatsapp:+919304987505'
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
    const message =
      `*Booking Confirmed - Forest Gate Sanctuary*\n\n` +
      `Dear ${booking.fullName},\n` +
      `Your booking for *${booking.roomName || "Sanctuary Stay"}* has been confirmed!\n\n` +
      `*Dates:* ${checkInStr} - ${new Date(booking.checkOut).toLocaleDateString()}\n` +
      `*Total:* ₹${booking.totalAmount.toLocaleString()}\n\n` +
      `*Cancellation Policy:* Full refund only if cancelled 10+ days before arrival (${checkInStr}).\n\n` +
      `We look forward to seeing you!`;

    const response = await twilioClient.messages.create({
      body: message,
      from: twilioNumber,
      to: `whatsapp:${booking.phone.startsWith("+") ? booking.phone : "+91" + booking.phone}`,
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
    const message =
      `*Booking Request Received - The Forest Gate*\n\n` +
      `Dear ${booking.fullName},\n` +
      `Thank you for choosing The Forest Gate! 🏕️\n\n` +
      `Your booking request for *${booking.roomName || booking.bookingType || "Sanctuary Stay"}* has been received and is currently *pending confirmation* by our team.\n\n` +
      `*Dates:* ${checkInStr} – ${checkOutStr}\n` +
      `*Guests:* ${booking.guests?.adults || 0} Adults, ${booking.guests?.children || 0} Children\n` +
      `*Total:* ₹${booking.totalAmount?.toLocaleString()}\n\n` +
      `You will receive a confirmation message once our team approves your booking. We'll be in touch shortly! 🙏`;

    const response = await twilioClient.messages.create({
      body: message,
      from: twilioNumber,
      to: `whatsapp:${booking.phone.startsWith("+") ? booking.phone : "+91" + booking.phone}`,
    });

    console.log(`Guest pending WhatsApp sent: ${response.sid}`);
    return { sid: response.sid, status: response.status };
  } catch (error) {
    console.error("Twilio Guest Pending Error:", error.message);
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
    const reasons =
      booking.cancellationReasons?.length > 0
        ? booking.cancellationReasons.join(", ")
        : "Not specified";

    const message =
      `*Booking Cancelled - The Forest Gate*\n\n` +
      `Dear ${booking.fullName},\n` +
      `Your booking for *${booking.roomName || booking.bookingType || "Sanctuary Stay"}* has been *cancelled*.\n\n` +
      `*Check-in Date:* ${checkInStr}\n` +
      `*Reason:* ${reasons}\n` +
      (booking.cancellationNote
        ? `*Note:* ${booking.cancellationNote}\n\n`
        : `\n`) +
      `If you have any questions, please contact us. We hope to welcome you at The Forest Gate in the future. 🙏`;

    const response = await twilioClient.messages.create({
      body: message,
      from: twilioNumber,
      to: `whatsapp:${booking.phone.startsWith("+") ? booking.phone : "+91" + booking.phone}`,
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
};
