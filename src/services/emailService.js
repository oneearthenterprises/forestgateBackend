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
};
