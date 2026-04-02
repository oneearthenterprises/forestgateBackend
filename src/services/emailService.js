import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // forestgatemorni@gmail.com
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

/**
 * Helper to get formatted room list
 */
const getRoomListStr = (booking, fallbackRoomName = "Sanctuary Stay") => {
  if (booking.allocation && booking.allocation.length > 0) {
    return booking.allocation
      .map((r) => r.name || booking.bookingType || fallbackRoomName)
      .join(", ");
  }
  return booking.roomName || booking.bookingType || fallbackRoomName;
};

/**
 * Helper to dynamically calculate total based on allocation
 */
const getDynamicTotal = (booking) => {
  if (!booking) return 0;

  // Always use the database's totalAmount if it exists (it includes tax and discounts)
  if (booking.totalAmount) {
    return Number(booking.totalAmount);
  }

  // Fallback logic
  const inDate = new Date(booking.checkIn);
  const outDate = new Date(booking.checkOut);
  const nights = Math.max(
    1,
    Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24)),
  );

  if (booking.allocation && booking.allocation.length > 0) {
    const allocSum = booking.allocation.reduce(
      (sum, r) => sum + (Number(r.price) || 0),
      0,
    );
    const addonsSum = (booking.addons || [])
      .filter((a) => a.status !== "cancelled")
      .reduce((s, a) => s + (Number(a.price) || 0), 0);

    const baseTotal = allocSum * nights + addonsSum;
    const discount = baseTotal * 0.10;
    const taxes = (baseTotal - discount) * 0.18;
    return Math.round(baseTotal - discount + taxes);
  }
  return 0;
};

const getPricingBreakdownHtml = (booking) => {
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

  if (subtotal === 0) return ''; // fallback if empty

  const discount = Math.round(subtotal * 0.10);
  const taxes = Math.round((subtotal - discount) * 0.18);

  let html = `
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <h4 style="margin: 0 0 15px 0; color: #111827; text-transform: uppercase; font-size: 12px; letter-spacing:1px;">Pricing Breakdown</h4>
      <div style="display:table; width:100%; margin-bottom: 8px; font-size: 14px;">
        <div style="display:table-cell; color:#4b5563;">Base Room Price (${nights} Nights)</div>
        <div style="display:table-cell; text-align:right; font-weight:bold; color:#111827;">₹${baseRoomTotal.toLocaleString()}</div>
      </div>
  `;

  if (addonsSum > 0) {
    html += `
      <div style="display:table; width:100%; margin-bottom: 8px; font-size: 14px;">
        <div style="display:table-cell; color:#4b5563;">Extra Bedding / Services</div>
        <div style="display:table-cell; text-align:right; font-weight:bold; color:#111827;">₹${addonsSum.toLocaleString()}</div>
      </div>
    `;
  }

  html += `
      <div style="display:table; width:100%; margin-bottom: 8px; font-size: 14px; color: #059669;">
        <div style="display:table-cell;">10% Discount</div>
        <div style="display:table-cell; text-align:right; font-weight:bold;">-₹${discount.toLocaleString()}</div>
      </div>
      <div style="display:table; width:100%; margin-bottom: 15px; font-size: 14px;">
        <div style="display:table-cell; color:#4b5563;">18% GST</div>
        <div style="display:table-cell; text-align:right; font-weight:bold; color:#111827;">+₹${taxes.toLocaleString()}</div>
      </div>
    </div>
  `;

  return html;
};

const getBirthdayTemplate = (name, email) => `
<!DOCTYPE html>
<html>
<head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap');
      body { margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Inter', Arial, sans-serif; }
      .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
      .header { padding: 40px; text-align: center; background-color: #ffffff; }
      .logo { width: 130px; margin-bottom: 24px; }
      .hero-img { width: 100%; height: auto; display: block; }
      .content { padding: 48px 40px; text-align: center; }
      .title-text { font-family: 'Times New Roman', serif; font-size: 38px; font-weight: normal; color: #085d6b; margin: 0 0 16px 0; }
      .body-text { font-family: 'Times New Roman', serif; font-size: 18px; line-height: 1.8; color: #334155; margin-bottom: 32px; font-style: italic; }
      .cta-btn { display: inline-block; padding: 16px 32px; background-color: #085d6b; color: #ffffff !important; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
      .footer { background-color: #085d6b; padding: 40px; text-align: center; color: #ffffff; }
      .unsubscribe { margin-top: 24px; font-size: 11px; opacity: 0.6; }
      .unsubscribe a { color: #ffffff; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate" class="logo">
        </div>
        <img class="hero-img" src="https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=600&auto=format&fit=crop" alt="Celebration" />
        <div class="content">
            <h1 class="title-text">Happy Birthday, ${name}!</h1>
            <p class="body-text">
              Warmest wishes on your special day. May your coming year be as breathtaking as the Himalayan trails and as peaceful as the forest breeze. We have a special gift waiting for your next visit.
            </p>
            <a href="https://forestgatetrails.com" class="cta-btn">Claim Your Birthday Treat</a>
        </div>
        <div class="footer">
            <p style="font-style: italic; opacity: 0.9;">Celebrate with Forest Gate</p>
            <p class="unsubscribe">
              <a href="${process.env.API_URL || "http://localhost:5000"}/api/newsletter/unsubscribe?email=${email}">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

const getAnniversaryTemplate = (name, email) => `
<!DOCTYPE html>
<html>
<head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap');
      body { margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Inter', Arial, sans-serif; }
      .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
      .header { padding: 40px; text-align: center; background-color: #ffffff; }
      .logo { width: 130px; margin-bottom: 24px; }
      .hero-img { width: 100%; height: auto; display: block; }
      .content { padding: 48px 40px; text-align: center; }
      .title-text { font-family: 'Times New Roman', serif; font-size: 38px; font-weight: normal; color: #085d6b; margin: 0 0 16px 0; }
      .body-text { font-family: 'Times New Roman', serif; font-size: 18px; line-height: 1.8; color: #334155; margin-bottom: 32px; font-style: italic; }
      .cta-btn { display: inline-block; padding: 16px 32px; background-color: #085d6b; color: #ffffff !important; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
      .footer { background-color: #085d6b; padding: 40px; text-align: center; color: #ffffff; }
      .unsubscribe { margin-top: 24px; font-size: 11px; opacity: 0.6; }
      .unsubscribe a { color: #ffffff; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate" class="logo">
        </div>
        <img class="hero-img" src="https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=600&auto=format&fit=crop" alt="Anniversary" />
        <div class="content">
            <h1 class="title-text">Happy Anniversary, ${name}!</h1>
            <p class="body-text">
              Wishing you another year of love and laughter. May your journey together remain as timeless and enchanting as the Himalayan sanctuary we call home.
            </p>
            <a href="https://forestgatetrails.com" class="cta-btn">Plan Your Romantic Stay</a>
        </div>
        <div class="footer">
            <p style="font-style: italic; opacity: 0.9;">Celebrate with Forest Gate</p>
            <p class="unsubscribe">
              <a href="${process.env.API_URL || "http://localhost:5000"}/api/newsletter/unsubscribe?email=${email}">Unsubscribe</a>
            </p>
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
body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 0; margin: 0; }
.container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.header { background-color: #111111; padding: 30px 20px; text-align: center; border-bottom: 3px solid #fcb101; }
.header img { width: 140px; }
.content { padding: 40px 30px; text-align: center; color: #333333; }
.content h2 { font-family: 'Times New Roman', Times, serif; font-size: 28px; font-weight: normal; margin-top: 0; margin-bottom: 20px; color: #111111; letter-spacing: 1px; }
.content p { font-size: 16px; line-height: 1.5; color: #555555; margin-bottom: 30px; }
.otp-wrapper { background-color: #fafafa; border: 1px dashed #fcb101; padding: 25px; border-radius: 8px; margin-bottom: 30px; }
.otp { font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #111111; margin: 0; }
.note { font-size: 13px; color: #888888; margin-top: 10px; }
.footer { background-color: #f5f5f5; padding: 20px; text-align: center; color: #888888; font-size: 12px; border-top: 1px solid #eeeeee; }
.footer p { margin: 5px 0; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
      <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate Logo">
  </div>
  <div class="content">
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password. Please use the verification code below to proceed.</p>
    <div class="otp-wrapper">
      <div class="otp">${otp}</div>
      <div class="note">This code expires in 10 minutes.</div>
    </div>
    <p style="font-size: 14px; color: #888;">If you did not make this request, please ignore this email or contact our support team.</p>
  </div>
  <div class="footer">
    <p><strong>The Forest Gate Retreat & Trails</strong></p>
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
body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 0; margin: 0; }
.container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.header { background-color: #111111; padding: 30px 20px; text-align: center; border-bottom: 3px solid #fcb101; }
.header img { width: 140px; }
.content { padding: 40px 30px; text-align: center; color: #333333; }
.content h2 { font-family: 'Times New Roman', Times, serif; font-size: 28px; font-weight: normal; margin-top: 0; margin-bottom: 20px; color: #111111; letter-spacing: 1px; }
.content p { font-size: 16px; line-height: 1.5; color: #555555; margin-bottom: 30px; }
.success-icon { font-size: 64px; margin-bottom: 20px; }
.footer { background-color: #f5f5f5; padding: 20px; text-align: center; color: #888888; font-size: 12px; border-top: 1px solid #eeeeee; }
.footer p { margin: 5px 0; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
      <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate Logo">
  </div>
  <div class="content">
    <div class="success-icon">✔️</div>
    <h2>Password Updated</h2>
    <p>Your password has been successfully reset. You can now use your new password to log in to your Forest Gate account.</p>
    <p style="font-size: 14px; color: #888;">Time of change: ${new Date().toLocaleString()}</p>
  </div>
  <div class="footer">
    <p><strong>The Forest Gate Retreat & Trails</strong></p>
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
body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 0; margin: 0; }
.container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
.header { background-color: #111111; padding: 30px 20px; text-align: center; border-bottom: 3px solid #fcb101; }
.header img { width: 140px; }
.content { padding: 40px 30px; text-align: center; color: #333333; }
.content h2 { font-family: 'Times New Roman', Times, serif; font-size: 28px; font-weight: normal; margin-top: 0; margin-bottom: 20px; color: #111111; letter-spacing: 1px; }
.content p { font-size: 16px; line-height: 1.5; color: #555555; margin-bottom: 30px; }
.otp-wrapper { background-color: #fafafa; border: 1px solid #eeeeee; padding: 25px; border-radius: 8px; margin-bottom: 30px; }
.otp { font-size: 42px; font-weight: bold; letter-spacing: 12px; color: #111111; margin: 0; }
.note { font-size: 13px; color: #888888; margin-top: 10px; }
.footer { background-color: #f5f5f5; padding: 20px; text-align: center; color: #888888; font-size: 12px; border-top: 1px solid #eeeeee; }
.footer p { margin: 5px 0; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
      <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate Logo">
  </div>
  <div class="content">
    <h2>Secure Your Journey</h2>
    <p>Welcome to The Forest Gate. Please use the verification code below to complete your registration and unlock your Himalayan experience.</p>
    <div class="otp-wrapper">
      <div class="otp">${otp}</div>
      <div class="note">This code expires in 10 minutes.</div>
    </div>
    <p style="font-size: 14px; color: #888;">If you didn't request this code, you can safely ignore this email.</p>
  </div>
  <div class="footer">
    <p><strong>The Forest Gate Retreat & Trails</strong></p>
    <p>&copy; ${new Date().getFullYear()} Forest Gate Sanctuary. All rights reserved.</p>
  </div>
</div>
</body>
</html>
`;

export const verifyOtpRegisterOtp = async (email, otp) => {
  try {
    console.log("\n" + "=".repeat(50));
    console.log(`[AUTH] REGISTRATION OTP FOR ${email}: ${otp}`);
    console.log("=".repeat(50) + "\n");

    await transporter.sendMail({
      from: `"ForestGate" <forestgatemorni@gmail.com>`,
      to: email,
      subject: "Verify OTP - Forest Gate",
      html: getVerifyOtpTemplate(otp),
    });
  } catch (error) {
    console.error("Email Sending Error:", error);
  }
};

export const sendBirthdayEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: `"ForestGate" <forestgatemorni@gmail.com>`,
      to: email,
      subject: `Happy Birthday, ${name}! 🎂`,
      html: getBirthdayTemplate(name, email),
    });
    console.log(`Birthday email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending birthday email to ${email}:`, error);
  }
};

export const sendAnniversaryEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: `"ForestGate" <forestgatemorni@gmail.com>`,
      to: email,
      subject: `Happy Anniversary, ${name}! 🥂`,
      html: getAnniversaryTemplate(name, email),
    });
    console.log(`Anniversary email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending anniversary email to ${email}:`, error);
  }
};

export const sendForgotOtpEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"ForestGate" <forestgatemorni@gmail.com>`,
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
      from: `"ForestGate" <forestgatemorni@gmail.com>`,
      to: email,
      subject: `Password Reset Successfully - Forest Gate`,
      html: getResetSuccessTemplate(),
    });
    console.log(`Reset success email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending reset success email to ${email}:`, error);
  }
};

const getBookingConfirmationTemplate = (booking) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f6f9; padding: 20px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background-color: #111827; padding: 40px 20px; text-align: center; color: #ffffff; border-bottom: 4px solid #10b981; }
        .header h1 { font-size: 28px; margin: 0; font-weight: 700; letter-spacing: 1px; }
        .header p { color: #9ca3af; font-size: 14px; margin-top: 8px; letter-spacing: 2px; text-transform: uppercase; }
        .content { padding: 40px 30px; }
        .content h2 { font-size: 22px; color: #111827; margin-top: 0; margin-bottom: 20px; }
        .intro-text { font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 25px; }
        
        .status-badge { display: inline-block; background-color: #d1fae5; color: #065f46; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        
        .details-card { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 25px; margin-bottom: 25px; }
        .details-card h3 { margin: 0 0 15px 0; font-size: 16px; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
        
        .fallback-row { margin-bottom: 15px; }
        .fallback-col { display: inline-block; width: 48%; vertical-align: top; }
        
        .detail-label { display: block; font-size: 11px; font-weight: bold; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .detail-value { font-weight: 600; font-size: 15px; color: #111827; }
        
        .price-row { background-color: #f3f4f6; padding: 15px 20px; border-radius: 6px; margin-top: 20px; display: table; width: 100%; box-sizing: border-box; }
        .price-label { font-weight: 700; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: table-cell; vertical-align: middle; }
        .price-value { font-weight: 800; font-size: 22px; color: #111827; display: table-cell; text-align: right; vertical-align: middle; }

        .policy { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; font-size: 13px; color: #991b1b; line-height: 1.5; margin-top: 30px; font-weight: 500; }
        
        .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .contact-info { font-size: 13px; color: #4b5563; line-height: 1.6; margin-bottom: 15px; }
        .social-links a { color: #111827; text-decoration: none; font-weight: bold; font-size: 13px; margin: 0 10px; border-bottom: 1px solid #111827; }
        .copyright { font-size: 11px; color: #9ca3af; margin-top: 20px; }
        
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0; box-shadow: none; border: none; }
            .content { padding: 30px 20px; }
            .fallback-col { width: 100%; display: block; margin-bottom: 15px; }
            .price-row { display: block; text-align: left; }
            .price-label, .price-value { display: block; text-align: left; }
            .price-value { margin-top: 5px; }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate Logo" style="width: 140px; margin-bottom: 20px; filter: brightness(0) invert(1);">
                <h1>Booking Confirmed</h1>
                <p>Forest Gate Sanctuary</p>
            </div>
            
            <div class="content">
                <h2>Dear ${booking.fullName},</h2>
                <p class="intro-text">
                    Your booking has been successfully confirmed at Forest Gate Sanctuary. We are thrilled to welcome you and ensure your stay is as serene as the forest itself!
                </p>
                
                <div style="text-align: center;">
                    <span class="status-badge">✓ Confirmed</span>
                </div>
                
                <div class="details-card">
                    <h3>Reservation Details</h3>
                    
                    <div style="margin-bottom: 20px;">
                        <span class="detail-label">Booking ID</span>
                        <span class="detail-value" style="color: #4f46e5;">${booking.bookingId || booking._id}</span>
                    </div>

                    <div class="fallback-row">
                        <div class="fallback-col">
                            <span class="detail-label">Check-In</span>
                            <span class="detail-value">${new Date(booking.checkIn).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                        <div class="fallback-col">
                            <span class="detail-label">Check-Out</span>
                            <span class="detail-value">${new Date(booking.checkOut).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <span class="detail-label">Sanctuary Accommodation</span>
                        <span class="detail-value" style="display: block; line-height: 1.5;">${getRoomListStr(booking)}</span>
                    </div>
                    
                    <div class="fallback-row">
                        <div class="fallback-col">
                            <span class="detail-label">Guests</span>
                            <span class="detail-value">${booking.guests?.adults || booking.adults || 0} Adults, ${booking.guests?.children || booking.children || 0} Children</span>
                        </div>
                        <div class="fallback-col">
                            <span class="detail-label">Duration</span>
                            <span class="detail-value">${booking.totalNights || 1} Nights</span>
                        </div>
                    </div>
                    
                    <div class="price-row" style="padding-bottom: 10px; border-radius: 6px 6px 0 0;">
                        <span class="price-label">Total Amount Paid</span>
                        <span class="price-value">₹${getDynamicTotal(booking).toLocaleString()}</span>
                    </div>
                    <div style="background-color: #f3f4f6; padding: 0 20px 20px 20px; border-radius: 0 0 6px 6px;">
                        ${getPricingBreakdownHtml(booking)}
                    </div>
                </div>

                <div class="policy">
                    <strong>IMPORTANT:</strong> Cancellations with a full refund are only available up to 48 hours before check-in (${new Date(booking.checkIn).toLocaleDateString()}). Otherwise, the booking is non-refundable and cannot be cancelled.
                </div>
            </div>
            
            <div class="footer">
                <div class="contact-info">
                    <strong>Forest Gate Sanctuary</strong><br>
                    Need assistance? WhatsApp or call us at <a href="tel:+919876543210" style="color: #111827; text-decoration: none; font-weight: bold;">+91 98765 43210</a><br>
                    <a href="https://forestgatetrails.com" style="color: #111827; text-decoration: underline;">www.forestgatetrails.com</a>
                </div>
                
                <div class="social-links">
                    <a href="https://instagram.com/forestgatetrails">Instagram</a>
                    <a href="https://facebook.com/forestgatetrails">Facebook</a>
                </div>
                
                <div class="copyright">
                    &copy; ${new Date().getFullYear()} Forest Gate Sanctuary. All rights reserved.
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;

export const sendBookingConfirmationEmail = async (booking) => {
  try {
    await transporter.sendMail({
      from: `"ForestGate" <forestgatemorni@gmail.com>`,
      to: booking.email,
      subject: `Booking Confirmed - Forest Gate Sanctuary`,
      html: getBookingConfirmationTemplate(booking),
    });
    console.log(`Booking confirmation email sent to ${booking.email}`);
  } catch (error) {
    console.error(
      `Error sending confirmation email to ${booking.email}:`,
      error,
    );
  }
};

const getBookingReceivedTemplate = (booking) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7f9f7; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f7f9f7; padding: 20px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background-color: #1a3622; padding: 40px 20px; text-align: center; color: #ffffff; }
        .header h1 { font-size: 26px; margin: 0; font-weight: 600; letter-spacing: 1px; }
        .header p { color: #8fa696; font-size: 14px; margin-top: 8px; letter-spacing: 2px; text-transform: uppercase; }
        .content { padding: 40px 30px; }
        .content h2 { font-size: 20px; color: #1a3622; margin-top: 0; }
        .intro-text { font-size: 15px; color: #4a5568; line-height: 1.6; margin-bottom: 25px; }
        
        .status-badge { display: inline-block; background-color: #ffedd5; color: #c2410c; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        
        .details-card { background-color: #f8faf9; border: 1px solid #e2e8e5; border-radius: 8px; padding: 25px; margin-bottom: 25px; }
        .details-card h3 { margin: 0 0 15px 0; font-size: 16px; color: #1a3622; border-bottom: 1px solid #e2e8e5; padding-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
        
        .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; }
        .detail-item { font-size: 14px; color: #2d3748; }
        .detail-label { display: block; font-size: 11px; font-weight: bold; color: #718096; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .detail-value { font-weight: 500; font-size: 15px; color: #1a3622; }
        
        /* Fallback for email clients that don't support grid */
        .fallback-row { margin-bottom: 15px; }
        .fallback-col { display: inline-block; width: 48%; vertical-align: top; }
        
        .price-section { background-color: #1a3622; color: #ffffff; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px; }
        .price-section p { margin: 0; font-size: 14px; color: #a1b5a5; text-transform: uppercase; letter-spacing: 1px; }
        .price-section h2 { margin: 5px 0 0 0; font-size: 28px; color: #ffffff; }

        .next-steps { background-color: #f7fafc; padding: 20px; border-left: 4px solid #1a3622; font-size: 14px; color: #4a5568; line-height: 1.5; }
        
        .footer { background-color: #f1f5f2; padding: 30px; text-align: center; border-top: 1px solid #e2e8e5; }
        .contact-info { font-size: 13px; color: #4a5568; line-height: 1.6; margin-bottom: 15px; }
        .contact-info strong { color: #1a3622; }
        .social-links a { color: #1a3622; text-decoration: none; font-weight: bold; font-size: 13px; margin: 0 10px; border-bottom: 1px solid #1a3622; }
        .copyright { font-size: 11px; color: #718096; margin-top: 20px; }
        
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0; }
            .content { padding: 30px 20px; }
            .grid { grid-template-cols: 1fr; }
            .fallback-col { width: 100%; display: block; margin-bottom: 15px; }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate Logo" style="width: 140px; margin-bottom: 20px; filter: brightness(0) invert(1);">
                <h1>Request Received</h1>
                <p>FOREST GATE RETREAT and TRAILS</p>
            </div>
            
            <div class="content">
                <h2>Dear ${booking.fullName},</h2>
                <p class="intro-text">
                    Thank you for choosing Forest Gate. We have successfully received your booking request for the dates below. Our team is currently reviewing it to secure your sanctuary escape.
                </p>
                
                <div style="text-align: center;">
                    <span class="status-badge">Pending Confirmation</span>
                </div>
                
                <div class="details-card">
                    <h3>Stay Details</h3>
                    
                    <div class="fallback-row">
                        <div class="fallback-col">
                            <span class="detail-label">Check-In</span>
                            <span class="detail-value">${new Date(booking.checkIn).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                        <div class="fallback-col">
                            <span class="detail-label">Check-Out</span>
                            <span class="detail-value">${new Date(booking.checkOut).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <span class="detail-label">Sanctuary Accommodation</span>
                        <span class="detail-value" style="display: block; margin-bottom: 15px;">${getRoomListStr(booking)}</span>
                    </div>
                    
                    <div class="fallback-row">
                        <div class="fallback-col">
                            <span class="detail-label">Guests</span>
                            <span class="detail-value">${booking.guests?.adults || booking.adults || 0} Adults, ${booking.guests?.children || booking.children || 0} Children</span>
                        </div>
                        <div class="fallback-col">
                            <span class="detail-label">Total Duration</span>
                            <span class="detail-value">${booking.totalNights || 1} Nights</span>
                        </div>
                    </div>
                </div>
                
                <div class="price-section" style="padding-bottom: 10px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
                    <p>Estimated Total Rate</p>
                    <h2>₹${getDynamicTotal(booking).toLocaleString()}</h2>
                    <p style="font-size: 11px; margin-top: 5px; opacity: 0.8; text-transform: none;">* Includes all taxes and applicable fees</p>
                </div>
                <!-- Breakdown -->
                <div style="background-color: #f8faf9; border: 1px solid #e2e8e5; border-top: none; padding: 20px; border-radius: 0 0 8px 8px; margin-bottom: 25px;">
                  ${getPricingBreakdownHtml(booking)}
                </div>

                <div class="next-steps">
                    <strong>What happens next?</strong><br>
                    You will receive a final confirmation email shortly to finalize your payment securely. Please hang tight!
                </div>
            </div>
            
            <div class="footer">
                <div class="contact-info">
                    <strong>Forest Gate Sanctuary</strong><br>
                    Have questions? Call or WhatsApp us at <a href="tel:+919876543210" style="color: #1a3622; text-decoration: none; font-weight: bold;">+91 98765 43210</a><br>
                    <a href="https://forestgatetrails.com" style="color: #1a3622; text-decoration: underline;">www.forestgatetrails.com</a>
                </div>
                
                <div class="social-links">
                    <a href="https://instagram.com/forestgatetrails">Instagram</a>
                    <a href="https://facebook.com/forestgatetrails">Facebook</a>
                </div>
                
                <div class="copyright">
                    &copy; ${new Date().getFullYear()} Forest Gate Sanctuary. All rights reserved.
                </div>
            </div>
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
            <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate Logo" style="width: 150px; margin-bottom: 20px; filter: brightness(0) invert(1);">
            <h1>Booking Cancelled</h1>
            <p>Forest Gate Sanctuary</p>
        </div>
        <div class="content">
            <h2>Dear ${booking.fullName},</h2>
            <p>Your booking for the following dates has been cancelled as requested or due to policy restrictions.</p>
            
            <div class="details">
                <p><strong>Booking ID:</strong> ${booking.bookingId || booking._id}</p>
                <p><strong>Dates:</strong> ${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}</p>
                <p><strong>Reason:</strong> ${booking.cancellationReasons?.join(", ") || "User/Policy Cancelled"}</p>
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
      from: `"ForestGate" <forestgatemorni@gmail.com>`,
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
      from: `"ForestGate" <forestgatemorni@gmail.com>`,
      to: booking.email,
      subject: `Booking Cancelled - Forest Gate Sanctuary`,
      html: getBookingCancelledTemplate(booking),
    });
  } catch (error) {
    console.error(
      `Error sending cancellation email to ${booking.email}:`,
      error,
    );
  }
};

const getPaymentConfirmationUserTemplate = (booking) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Times New Roman', Times, serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 650px; background-color: #ffffff; margin: 20px auto; border: 1px solid #c6f6d5; }
        .header { background-color: #2f855a; padding: 40px; text-align: center; color: #fff; }
        .header h1 { font-size: 28px; margin: 0; }
        .content { padding: 40px; }
        .details-box { background-color: #f0fff4; padding: 25px; border: 1px solid #c6f6d5; margin: 20px 0; border-radius: 8px; }
        .details-box h3 { margin-top: 0; color: #2f855a; border-bottom: 1px solid #c6f6d5; padding-bottom: 10px; font-size: 18px; }
        .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .item { margin: 8px 0; font-size: 14px; color: #2d3748; }
        .label { font-weight: bold; color: #4a5568; }
        
        .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .invoice-table th { text-align: left; padding: 12px; background-color: #f7fafc; border-bottom: 2px solid #edf2f7; color: #4a5568; font-size: 12px; text-transform: uppercase; }
        .invoice-table td { padding: 12px; border-bottom: 1px solid #edf2f7; font-size: 14px; }
        .total-row { font-weight: bold; background-color: #f0fff4; }
        
        .section-title { font-size: 16px; font-weight: bold; color: #2f855a; margin: 25px 0 10px 0; text-transform: uppercase; letter-spacing: 1px; }
        .info-text { font-size: 14px; color: #4a5568; line-height: 1.6; background: #f7fafc; padding: 15px; border-radius: 4px; }
        
        .cta-button { display: inline-block; padding: 14px 28px; background-color: #2f855a; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 25px; text-align: center; }
        .footer { background-color: #a8aca1; padding: 25px; text-align: center; color: #fff; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate Logo" style="width: 120px; margin-bottom: 15px; filter: brightness(0) invert(1);">
            <h1>Payment Confirmation</h1>
            <p>Forest Gate Sanctuary</p>
        </div>
        <div class="content">
            <h2>Dear ${booking.fullName},</h2>
            <p>Thank you for your payment! We have successfully received the funds for your upcoming stay at Forest Gate Sanctuary. Your reservation is now fully secured.</p>
            
            <div class="details-box">
                <h3>Booking Summary</h3>
                <div class="grid">
                    <div class="item"><span class="label">Booking ID:</span> ${booking.bookingId || booking._id}</div>
                    <div class="item"><span class="label">Status:</span> <span style="color: #2f855a; font-weight: bold;">Paid</span></div>
                    <div class="item"><span class="label">Check-in:</span> ${new Date(booking.checkIn).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
                    <div class="item"><span class="label">Check-out:</span> ${new Date(booking.checkOut).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
                </div>
            </div>

            <div class="section-title">Guest Details & Members</div>
            <div class="info-text">
                <p><strong>Lead Guest:</strong> ${booking.fullName}</p>
                <p><strong>Total Guests:</strong> ${booking.guests?.adults || 0} Adults, ${booking.guests?.children || 0} Children</p>
                ${booking.guestDetails && booking.guestDetails.length > 0
    ? `
                    <p><strong>Members List:</strong></p>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        ${booking.guestDetails.map((guest) => `<li>${guest.name} (${guest.type}${guest.age ? `, Age: ${guest.age}` : ""})</li>`).join("")}
                    </ul>
                `
    : ""
  }
            </div>

            <div class="section-title">Financial Summary / Invoice</div>
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Stay: ${getRoomListStr(booking)} (${booking.totalNights} Nights)</td>
                        <td style="text-align: right;">₹${(booking.allocation &&
    booking.allocation.length > 0
    ? booking.allocation.reduce(
      (sum, r) => sum + (Number(r.price) || 0),
      0,
    ) * (booking.totalNights || 1)
    : (booking.pricePerNight || 0) *
    (booking.totalNights || 1)
  ).toLocaleString()}</td>
                    </tr>
                    ${booking.addons && booking.addons.length > 0
    ? booking.addons
      .filter((a) => a.status !== "cancelled")
      .map(
        (addon) => `
                        <tr>
                            <td>Add-on: ${addon.name}</td>
                            <td style="text-align: right;">₹${(addon.price || 0).toLocaleString()}</td>
                        </tr>
                    `,
      )
      .join("")
    : ""
  }
                    <tr class="total-row">
                        <td>TOTAL PAID</td>
                        <td style="text-align: right;">₹${getDynamicTotal(booking).toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>

            ${booking.specialRequest
    ? `
                <div class="section-title">Special Requests</div>
                <div class="info-text">${booking.specialRequest}</div>
            `
    : ""
  }

            ${booking.notes
    ? `
                <div class="section-title">Stay Notes</div>
                <div class="info-text">${booking.notes}</div>
            `
    : ""
  }

            <div style="text-align: center;">
                <a href="https://forestgatetrails.com/my-bookings" class="cta-button">Manage My Booking</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #718096; text-align: center;">
                If you have any further requirements or changes, please feel free to reach out to us.
            </p>
        </div>
        <div class="footer">
            <p><strong>The Forest Gate Sanctuary</strong></p>
            <p>Sanctuary Trails, Nature Reserve</p>
            <p>&copy; ${new Date().getFullYear()} Forest Gate. All rights reserved.</p>
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
            <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate Logo" style="width: 120px; margin-bottom: 15px; filter: brightness(0) invert(1);">
            <h2>New Payment Alert</h2>
        </div>
        <div class="content">
            <p>A user has successfully paid the booking amount.</p>
            <div class="details">
                <p><strong>User:</strong> ${booking.fullName} (${booking.email})</p>
                <p><strong>Booking ID:</strong> ${booking.bookingId || booking._id}</p>
                <p><strong>Amount:</strong> ₹${getDynamicTotal(booking).toLocaleString()}</p>
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
      from: `"ForestGate" <forestgatemorni@gmail.com>`,
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
      from: `"ForestGate" <forestgatemorni@gmail.com>`,
      to: "forestgatemorni@gmail.com",
      subject: `ALERT: Payment Received from ${booking.fullName}`,
      html: getPaymentConfirmationAdminTemplate(booking),
    });
    console.log(`Payment alert email sent to admin`);
  } catch (error) {
    console.error(`Error sending admin payment email:`, error);
  }
};
