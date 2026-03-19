import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "mail.forestgatetrails.com",
  port: 465,
  secure: true,
  auth: {
    user: "admin@forestgatetrails.com",
    pass: process.env.EMAIL_PASS,
  },
});

const getBirthdayTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Times New Roman', Times, serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; background-color: #ffffff; margin: 20px auto; border-spacing: 0; }
        .header { padding: 40px 20px 20px 20px; text-align: center; }
        .header h1 { font-size: 64px; margin: 0; color: #111; }
        .header p { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; letter-spacing: 2px; color: #333; margin: 10px 0 0 0; text-transform: uppercase; }
        .banner { width: 100%; display: block; }
        .content { padding: 40px 30px; text-align: center; }
        .content h2 { font-size: 28px; font-weight: bold; color: #111; margin: 0 0 20px 0; text-transform: uppercase; }
        .content p { font-size: 18px; color: #555; line-height: 1.6; margin: 0 0 30px 0; font-style: italic; }
        .cta { text-decoration: underline; color: #111; font-weight: bold; font-size: 16px; }
        .footer { background-color: #a8aca1; padding: 30px 20px; text-align: center; color: #fff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate Logo" style="width: 150px; margin-bottom: 20px;">
            <h1>Happy Birthday!</h1>
            <p>Celebrate at Forest Gate</p>
        </div>
        <img class="banner" src="https://images.unsplash.com/photo-1530103862676-fa8c9d34bb34?q=80&w=600&auto=format&fit=crop" alt="Birthday Celebration" />
        <div class="content">
            <h2>Dear ${name},</h2>
            <p>Warmest wishes on your special day! May your year ahead be filled with adventure, serenity, and beautiful moments.</p>
            <p>As a birthday gift from us, enjoy a special treat on your next visit to Forest Gate Sanctuary.</p>
            <a href="https://forestgatetrails.com" class="cta">Book Your Birthday Escape</a>
        </div>
        <div class="footer">
            <p>Follow Forest Gate</p>
        </div>
    </div>
</body>
</html>
`;

const getAnniversaryTemplate = (name) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Times New Roman', Times, serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; background-color: #ffffff; margin: 20px auto; border-spacing: 0; }
        .header { padding: 40px 20px 20px 20px; text-align: center; }
        .header h1 { font-size: 64px; margin: 0; color: #111; }
        .header p { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; letter-spacing: 2px; color: #333; margin: 10px 0 0 0; text-transform: uppercase; }
        .banner { width: 100%; display: block; }
        .content { padding: 40px 30px; text-align: center; }
        .content h2 { font-size: 28px; font-weight: bold; color: #111; margin: 0 0 20px 0; text-transform: uppercase; }
        .content p { font-size: 18px; color: #555; line-height: 1.6; margin: 0 0 30px 0; font-style: italic; }
        .cta { text-decoration: underline; color: #111; font-weight: bold; font-size: 16px; }
        .footer { background-color: #a8aca1; padding: 30px 20px; text-align: center; color: #fff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate Logo" style="width: 150px; margin-bottom: 20px;">
            <h1>Happy Anniversary!</h1>
            <p>Eternal Love at Forest Gate</p>
        </div>
        <img class="banner" src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop" alt="Anniversary Celebration" />
        <div class="content">
            <h2>Dear ${name},</h2>
            <p>Wishing you another year of love, laughter, and beautiful memories together. May your journey be as magical as the trails of Forest Gate.</p>
            <p>Celebrate your milestone with a romantic stay at our sanctuary.</p>
            <a href="https://forestgatetrails.com" class="cta">Plan Your Anniversary Getaway</a>
        </div>
        <div class="footer">
            <p>Follow Forest Gate</p>
        </div>
    </div>
</body>
</html>
`;

const getForgotOtpTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Times New Roman', Times, serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; background-color: #ffffff; margin: 20px auto; border-spacing: 0; }
        .header { padding: 40px 20px 20px 20px; text-align: center; }
        .header h1 { font-size: 48px; margin: 0; color: #111; }
        .header p { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; letter-spacing: 2px; color: #333; margin: 10px 0 0 0; text-transform: uppercase; }
        .banner { width: 100%; display: block; }
        .content { padding: 40px 30px; text-align: center; }
        .otp-box { background-color: #f9f9f9; border: 1px dashed #a8aca1; padding: 20px; margin: 20px 0; display: inline-block; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111; }
        .content p { font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 20px 0; }
        .footer { background-color: #a8aca1; padding: 20px; text-align: center; color: #fff; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate Logo" style="width: 120px; margin-bottom: 20px;">
            <h1>Reset Password</h1>
            <p>Security at Forest Gate</p>
        </div>
        <img class="banner" src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=600&auto=format&fit=crop" alt="Security" />
        <div class="content">
            <p>You requested to reset your password. Use the following OTP to proceed. This code is valid for 10 minutes.</p>
            <div class="otp-box">
                <span class="otp-code">${otp}</span>
            </div>
            <p>If you did not request this, please ignore this email or contact support.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Forest Gate Sanctuary. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const getResetSuccessTemplate = () => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Times New Roman', Times, serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; background-color: #ffffff; margin: 20px auto; border-spacing: 0; }
        .header { padding: 40px 20px 20px 20px; text-align: center; }
        .header h1 { font-size: 48px; margin: 0; color: #111; }
        .header p { font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; letter-spacing: 2px; color: #333; margin: 10px 0 0 0; text-transform: uppercase; }
        .banner { width: 100%; display: block; }
        .content { padding: 40px 30px; text-align: center; }
        .content h2 { font-size: 24px; font-weight: bold; color: #111; margin: 0 0 20px 0; text-transform: uppercase; }
        .content p { font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 30px 0; }
        .footer { background-color: #a8aca1; padding: 20px; text-align: center; color: #fff; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate Logo" style="width: 120px; margin-bottom: 20px;">
            <h1>Success!</h1>
            <p>Account Updated</p>
        </div>
        <img class="banner" src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600&auto=format&fit=crop" alt="Success" />
        <div class="content">
            <h2>Password Reset Successfully</h2>
            <p>Your password has been securely updated. You can now log in to your account with your new password.</p>
            <p>Time: ${new Date().toLocaleString()}</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Forest Gate Sanctuary. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const getVerifyOtpTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body {
  font-family: Arial, sans-serif;
  background:#f4f4f4;
  padding:0;
  margin:0;
}
.container{
  max-width:600px;
  margin:20px auto;
  background:white;
}
.content{
  padding:40px;
  text-align:center;
}
.otp{
  font-size:32px;
  font-weight:bold;
  letter-spacing:8px;
  margin:20px 0;
  color:#111;
}
.footer{
  background:#a8aca1;
  padding:20px;
  color:white;
  text-align:center;
}
</style>
</head>
<body>
<div class="container">
<div class="content">
<h2>Email Verification</h2>
<p>Your OTP for account verification:</p>
<div class="otp">${otp}</div>
<p>This OTP is valid for 10 minutes.</p>
</div>
<div class="footer">
Forest Gate
</div>
</div>
</body>
</html>
`;

export const verifyOtpRegisterOtp = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"ForestGate" <admin@forestgatetrails.com>`,
      to: email,
      subject: "Verify OTP - Forest Gate",
      html: getVerifyOtpTemplate(otp),
    });
  } catch (error) {
    console.error(error);
  }
};

export const sendBirthdayEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: `"ForestGate" <admin@forestgatetrails.com>`,
      to: email,
      subject: `Happy Birthday, ${name}! 🎂`,
      html: getBirthdayTemplate(name),
    });
    console.log(`Birthday email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending birthday email to ${email}:`, error);
  }
};

export const sendAnniversaryEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: `"ForestGate" <admin@forestgatetrails.com>`,
      to: email,
      subject: `Happy Anniversary, ${name}! 🥂`,
      html: getAnniversaryTemplate(name),
    });
    console.log(`Anniversary email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending anniversary email to ${email}:`, error);
  }
};

export const sendForgotOtpEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"ForestGate" <admin@forestgatetrails.com>`,
      to: email,
      subject: `Reset Password OTP - Forest Gate`,
      html: getForgotOtpTemplate(otp),
    });
    console.log(`Reset OTP email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending reset OTP email to ${email}:`, error);
  }
};

export const sendResetSuccessEmail = async (email) => {
  try {
    await transporter.sendMail({
      from: `"ForestGate" <admin@forestgatetrails.com>`,
      to: email,
      subject: `Password Reset Successfully - Forest Gate`,
      html: getResetSuccessTemplate(),
    });
    console.log(`Reset success email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending reset success email to ${email}:`, error);
  }
};const getBookingConfirmationTemplate = (booking) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Times New Roman', Times, serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; background-color: #ffffff; margin: 20px auto; border: 1px solid #e0e0e0; }
        .header { background-color: #111; padding: 40px; text-align: center; color: #fff; }
        .header h1 { font-size: 32px; margin: 0; letter-spacing: 2px; }
        .content { padding: 40px; }
        .details { background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .details p { margin: 10px 0; font-size: 14px; color: #333; }
        .policy { color: #d32f2f; font-weight: bold; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; font-size: 13px; }
        .footer { background-color: #a8aca1; padding: 20px; text-align: center; color: #fff; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Booking Confirmed</h1>
            <p>Forest Gate Sanctuary</p>
        </div>
        <div class="content">
            <h2>Dear ${booking.fullName},</h2>
            <p>Your booking has been successfully confirmed at Forest Gate Sanctuary. We are excited to welcome you!</p>
            
            <div class="details">
                <p><strong>Booking ID:</strong> ${booking.bookingId || booking._id}</p>
                <p><strong>Room:</strong> ${booking.roomName || 'Sanctuary Stay'}</p>
                <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> ₹${booking.totalAmount.toLocaleString()}</p>
            </div>

            <p class="policy">
                IMPORTANT: Cancellations with a full refund are only available up to 10 days before your reaching the resort (${new Date(booking.checkIn).toLocaleDateString()}). Otherwise, the booking is non-refundable and cannot be cancelled.
            </p>

            <p>If you have any questions, please reply to this email or contact us via WhatsApp.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Forest Gate Sanctuary. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const sendBookingConfirmationEmail = async (booking) => {
  try {
    await transporter.sendMail({
      from: `"ForestGate" <admin@forestgatetrails.com>`,
      to: booking.email,
      subject: `Booking Confirmed - Forest Gate Sanctuary`,
      html: getBookingConfirmationTemplate(booking),
    });
    console.log(`Booking confirmation email sent to ${booking.email}`);
  } catch (error) {
    console.error(`Error sending confirmation email to ${booking.email}:`, error);
  }
};

const getBookingReceivedTemplate = (booking) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Times New Roman', Times, serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; background-color: #ffffff; margin: 20px auto; border: 1px solid #e0e0e0; }
        .header { background-color: #f5f5f5; padding: 40px; text-align: center; color: #333; }
        .header h1 { font-size: 28px; margin: 0; letter-spacing: 1px; }
        .content { padding: 40px; }
        .details { background-color: #fdfdfd; padding: 20px; border: 1px solid #eee; margin: 20px 0; }
        .details p { margin: 10px 0; font-size: 14px; color: #444; }
        .footer { background-color: #a8aca1; padding: 20px; text-align: center; color: #fff; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Booking Request Received</h1>
            <p>Forest Gate Sanctuary</p>
        </div>
        <div class="content">
            <h2>Dear ${booking.fullName},</h2>
            <p>Thank you for choosing Forest Gate Sanctuary. We have received your booking request and it is currently being reviewed by our team.</p>
            
            <div class="details">
                <p><strong>Status:</strong> Pending Confirmation</p>
                <p><strong>Room:</strong> ${booking.roomName || 'Sanctuary Stay'}</p>
                <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
            </div>

            <p>Once our team confirms your reservation, you will receive another email with final confirmation details.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Forest Gate Sanctuary. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const getBookingCancelledTemplate = (booking) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Times New Roman', Times, serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; background-color: #ffffff; margin: 20px auto; border: 1px solid #f8d7da; }
        .header { background-color: #721c24; padding: 40px; text-align: center; color: #fff; }
        .header h1 { font-size: 28px; margin: 0; }
        .content { padding: 40px; }
        .details { background-color: #fff5f5; padding: 20px; border: 1px solid #f5c6cb; margin: 20px 0; }
        .details p { margin: 10px 0; font-size: 14px; color: #721c24; }
        .footer { background-color: #a8aca1; padding: 20px; text-align: center; color: #fff; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Booking Cancelled</h1>
            <p>Forest Gate Sanctuary</p>
        </div>
        <div class="content">
            <h2>Dear ${booking.fullName},</h2>
            <p>Your booking for the following dates has been cancelled as requested or due to policy restrictions.</p>
            
            <div class="details">
                <p><strong>Booking ID:</strong> ${booking.bookingId || booking._id}</p>
                <p><strong>Dates:</strong> ${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}</p>
                <p><strong>Reason:</strong> ${booking.cancellationReasons?.join(', ') || 'User/Policy Cancelled'}</p>
            </div>

            <p>If you have any questions or would like to re-book for another date, please visit our website or contact us.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Forest Gate Sanctuary. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const sendBookingReceivedEmail = async (booking) => {
  try {
    await transporter.sendMail({
      from: `"ForestGate" <admin@forestgatetrails.com>`,
      to: booking.email,
      subject: `Booking Request Received - Forest Gate Sanctuary`,
      html: getBookingReceivedTemplate(booking),
    });
  } catch (error) {
    console.error(`Error sending received email to ${booking.email}:`, error);
  }
};

export const sendBookingCancelledEmail = async (booking) => {
  try {
    await transporter.sendMail({
      from: `"ForestGate" <admin@forestgatetrails.com>`,
      to: booking.email,
      subject: `Booking Cancelled - Forest Gate Sanctuary`,
      html: getBookingCancelledTemplate(booking),
    });
  } catch (error) {
    console.error(`Error sending cancellation email to ${booking.email}:`, error);
  }
};
const getPaymentConfirmationUserTemplate = (booking) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Times New Roman', Times, serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; background-color: #ffffff; margin: 20px auto; border: 1px solid #c6f6d5; }
        .header { background-color: #2f855a; padding: 40px; text-align: center; color: #fff; }
        .header h1 { font-size: 28px; margin: 0; }
        .content { padding: 40px; }
        .details { background-color: #f0fff4; padding: 20px; border: 1px solid #c6f6d5; margin: 20px 0; }
        .details p { margin: 10px 0; font-size: 14px; color: #2f855a; }
        .cta-button { display: inline-block; padding: 12px 24px; background-color: #2f855a; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
        .footer { background-color: #a8aca1; padding: 20px; text-align: center; color: #fff; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Received</h1>
            <p>Forest Gate Sanctuary</p>
        </div>
        <div class="content">
            <h2>Dear ${booking.fullName},</h2>
            <p>Thank you! We have successfully received your payment for the booking at Forest Gate Sanctuary.</p>
            
            <div class="details">
                <p><strong>Booking ID:</strong> ${booking.bookingId || booking._id}</p>
                <p><strong>Amount Paid:</strong> ₹${booking.totalAmount.toLocaleString()}</p>
                <p><strong>Payment Status:</strong> Paid</p>
            </div>

            <p>You can now view and download your invoice from your dashboard.</p>
            
            <a href="https://forestgatetrails.com/my-bookings" class="cta-button">View My Bookings</a>

            <p>We look forward to hosting you soon!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Forest Gate Sanctuary. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

const getPaymentConfirmationAdminTemplate = (booking) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; background-color: #ffffff; margin: 20px auto; border: 1px solid #e2e8f0; }
        .header { background-color: #2d3748; padding: 30px; text-align: center; color: #fff; }
        .content { padding: 30px; }
        .details { background-color: #f7fafc; padding: 20px; border: 1px solid #e2e8f0; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #718096; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Payment Alert</h2>
        </div>
        <div class="content">
            <p>A user has successfully paid the booking amount.</p>
            <div class="details">
                <p><strong>User:</strong> ${booking.fullName} (${booking.email})</p>
                <p><strong>Booking ID:</strong> ${booking.bookingId || booking._id}</p>
                <p><strong>Amount:</strong> ₹${booking.totalAmount.toLocaleString()}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
            </div>
            <p>Visit the admin dashboard to manage bookings.</p>
        </div>
        <div class="footer">
            <p>This is an automated system notification.</p>
        </div>
    </div>
</body>
</html>
`;

export const sendPaymentConfirmationToUser = async (booking) => {
  try {
    await transporter.sendMail({
      from: `"ForestGate" <admin@forestgatetrails.com>`,
      to: booking.email,
      subject: `Payment Confirmed - Forest Gate Sanctuary`,
      html: getPaymentConfirmationUserTemplate(booking),
    });
    console.log(`Payment confirmation email sent to user: ${booking.email}`);
  } catch (error) {
    console.error(`Error sending user payment email:`, error);
  }
};

export const sendPaymentConfirmationToAdmin = async (booking) => {
  try {
    await transporter.sendMail({
      from: `"ForestGate" <admin@forestgatetrails.com>`,
      to: "admin@forestgatetrails.com",
      subject: `ALERT: Payment Received from ${booking.fullName}`,
      html: getPaymentConfirmationAdminTemplate(booking),
    });
    console.log(`Payment alert email sent to admin`);
  } catch (error) {
    console.error(`Error sending admin payment email:`, error);
  }
};
