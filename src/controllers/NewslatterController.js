import Newslatter from "../models/Newslatter.js";
import nodemailer from "nodemailer";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const newsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Please provide email",
      });
    }
    const user = await Newslatter.findOne({ email });
    if (user) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const newUser = await Newslatter.create({ email });

    // Send Welcome Email
    const transporter = nodemailer.createTransport({
      host: "mail.forestgatetrails.com",
      port: 465,
      secure: true,
      auth: {
        user: "admin@forestgatetrails.com",
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap');
          body { margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Inter', Arial, sans-serif; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
          .header { padding: 40px; text-align: center; background-color: #ffffff; }
          .logo { width: 140px; margin-bottom: 24px; }
          .hero-img { width: 100%; height: auto; display: block; }
          .content { padding: 48px 40px; text-align: center; }
          .welcome-text { font-family: 'Times New Roman', serif; font-size: 42px; font-weight: normal; color: #085d6b; margin: 0 0 16px 0; }
          .sub-text { font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin-bottom: 32px; }
          .body-text { font-family: 'Times New Roman', serif; font-size: 18px; line-height: 1.8; color: #334155; margin-bottom: 32px; font-style: italic; }
          .cta-btn { display: inline-block; padding: 18px 36px; background-color: #085d6b; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease; }
          .footer { background-color: #085d6b; padding: 48px 40px; text-align: center; color: #ffffff; }
          .footer-title { font-family: 'Times New Roman', serif; font-size: 18px; font-style: italic; margin-bottom: 24px; opacity: 0.9; }
          .social-links a { color: #ffffff; text-decoration: none; font-size: 20px; margin: 0 12px; opacity: 0.8; }
          .social-links a:hover { opacity: 1; }
          .unsubscribe { margin-top: 32px; font-size: 11px; opacity: 0.6; }
          .unsubscribe a { color: #ffffff; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate" class="logo">
          </div>
          <img src="https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=600&auto=format&fit=crop" alt="The Sanctuary" class="hero-img">
          <div class="content">
            <h1 class="welcome-text">Namaste.</h1>
            <p class="sub-text">Welcome to the Forest Gate Sanctuary</p>
            <p class="body-text">
              We're delighted to have you with us. From here on, you'll be the first to receive exclusive insights into our Himalayan retreats, sustainable adventures, and moments of pure tranquility from the heart of Himachal.
            </p>
            <a href="${process.env.FRONTEND_URL || "http://localhost:9003"}" class="cta-btn">Explore The Sanctuary</a>
          </div>
          <div class="footer">
            <p class="footer-title">Follow Forest Gate</p>
            <div class="social-links">
              <a href="https://www.facebook.com/profile.php?id=61588259480467#">f</a>
              <a href="https://www.instagram.com/forestgate.retreat/?hl=en">O</a>
              <a href="#">X</a>
            </div>
            <p class="unsubscribe">
              You're receiving this because you subscribed to our newsletters. <br>
              <a href="${process.env.API_URL || "http://localhost:5000"}/api/newsletter/unsubscribe?email=${email}">Unsubscribe instantly</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"ForestGate" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to The Forest Gate Newsletter!",
      html: emailHtml,
    });

    return res.status(201).json({
      message: "User created and welcome email sent successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Welcome email error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getNewsletter = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Newslatter.countDocuments();
    const users = await Newslatter.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      message: "Newsletter users fetched successfully",
      total,
      page,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const sendNewsletter = async (req, res) => {
  let tempFiles = [];
  try {
    const { subject, message, html } = req.body;

    if (!subject || (!message && !html)) {
      return res.status(400).json({
        message: "Please provide subject and message or html content",
      });
    }

    const users = await Newslatter.find();

    if (users.length === 0) {
      return res.status(404).json({
        message: "No subscribers found to send newsletter",
      });
    }

    let imageUrl =
      "https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=600&auto=format&fit=crop";

    if (req.files?.images && req.files.images.length > 0) {
      try {
        const file = req.files.images[0];
        tempFiles.push(file.path);

        const result = await cloudinary.uploader.upload(file.path, {
          folder: "forestgate/newsletters",
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        tempFiles.forEach((filePath) => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
        return res.status(500).json({
          message: "Failed to upload image to Cloudinary",
          error: uploadError.message,
        });
      }
    }

    const transporter = nodemailer.createTransport({
      host: "mail.forestgatetrails.com",
      port: 465,
      secure: true,
      auth: {
        user: "admin@forestgatetrails.com",
        pass: process.env.EMAIL_PASS,
      },
    });

    const sendPromises = users.map((user) => {
      const formattedMessage = message ? message.replace(/\\n/g, "<br />") : "";

      const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap');
          body { margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Inter', Arial, sans-serif; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
          .header { padding: 40px; text-align: center; background-color: #ffffff; }
          .logo { width: 140px; margin-bottom: 24px; }
          .hero-img { width: 100%; height: auto; display: block; }
          .content { padding: 48px 40px; text-align: left; }
          .title-text { font-family: 'Times New Roman', serif; font-size: 32px; font-weight: bold; color: #085d6b; margin: 0 0 24px 0; text-transform: uppercase; letter-spacing: 1px; }
          .body-text { font-family: 'Times New Roman', serif; font-size: 18px; line-height: 1.8; color: #334155; margin-bottom: 32px; }
          .cta-link { display: inline-block; font-family: 'Times New Roman', serif; font-size: 16px; color: #085d6b; text-decoration: underline; font-style: italic; font-weight: bold; }
          .footer { background-color: #085d6b; padding: 48px 40px; text-align: center; color: #ffffff; }
          .footer-title { font-family: 'Times New Roman', serif; font-size: 18px; font-style: italic; margin-bottom: 24px; opacity: 0.9; }
          .social-links a { color: #ffffff; text-decoration: none; font-size: 20px; margin: 0 12px; opacity: 0.8; }
          .social-links a:hover { opacity: 1; }
          .unsubscribe { margin-top: 32px; font-size: 11px; opacity: 0.6; }
          .unsubscribe a { color: #ffffff; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate" class="logo">
          </div>
          <img src="${imageUrl}" alt="Forest Gate Update" class="hero-img">
          <div class="content">
            <h2 class="title-text">${subject}</h2>
            <div class="body-text">
               ${formattedMessage}
            </div>
            <a href="${process.env.FRONTEND_URL || "http://localhost:9003"}" class="cta-link">Visit our website</a>
          </div>
          <div class="footer">
            <p class="footer-title">Follow Forest Gate</p>
            <div class="social-links">
              <a href="https://www.facebook.com/profile.php?id=61588259480467#">f</a>
              <a href="https://www.instagram.com/forestgate.retreat/?hl=en">O</a>
              <a href="#">X</a>
            </div>
            <p class="unsubscribe">
              Stay connected with nature. <br>
              <a href="${process.env.API_URL || "http://localhost:5000"}/api/newsletter/unsubscribe?email=${user.email}">Unsubscribe instantly</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

      return transporter.sendMail({
        from: `"ForestGate" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: subject,
        text: message,
        html: html || emailHtml,
      });
    });

    await Promise.all(sendPromises);

    // Clean up temporary files after successful sending
    tempFiles.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    return res.status(200).json({
      message: `Newsletter sent successfully to ${users.length} subscribers`,
    });
  } catch (error) {
    // Clean up temporary files upon error
    tempFiles.forEach((filePath) => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    console.error("Newsletter send error:", error);
    return res.status(500).json({
      message: "Internal server error during sending",
    });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).send("Email is required");
    }

    const deletedUser = await Newslatter.findOneAndDelete({ email });

    // Return a styled HTML page so the user sees proper confirmation when clicking the link
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed - Forest Gate</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: 'Inter', Arial, sans-serif; background-color: #fcfcfc; color: #333; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .container { text-align: center; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 400px; width: 90%; }
          h2 { color: #085d6b; margin-top: 0; }
          a { display: inline-block; margin-top: 20px; background-color: #085d6b; color: white; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-weight: bold; font-size: 14px; transition: background-color 0.3s; }
          a:hover { background-color: #06424d; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Unsubscribed</h2>
          ${
            deletedUser
              ? `<p><b>${email}</b> has been successfully removed from our mailing list. You will no longer receive newsletters from Forest Gate.</p>`
              : `<p>This email address is not currently on our mailing list.</p>`
          }
          <a href="${process.env.FRONTEND_URL || "http://localhost:9003"}">Return to Forest Gate</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
};
