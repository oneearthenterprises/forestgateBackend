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
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 20px auto; border-spacing: 0;">
          <tr>
            <td align="center" style="padding: 40px 20px 20px 20px;">
              <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate Logo" style="width: 180px; margin-bottom: 30px;">
              <h1 style="font-family: 'Times New Roman', Times, serif; font-size: 64px; margin: 0; color: #111;">Hello!</h1>
              <p style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; letter-spacing: 1px; color: #333; margin: 10px 0 0 0; text-transform: uppercase;">Welcome to the world<br>of Forest Gate</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0;">
               <img src="https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=600&auto=format&fit=crop" alt="Welcome Letters" width="600" style="display: block; width: 100%; max-width: 600px; height: auto;" />
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 40px 30px;">
              <h2 style="font-family: 'Times New Roman', Times, serif; font-size: 24px; font-weight: bold; color: #111; margin: 0 0 20px 0; text-transform: uppercase;">Thanks for signing up</h2>
              <p style="font-family: 'Times New Roman', Times, serif; font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">We want to make sure that we only send you news and updates about the things that you're interested in.</p>
              <p style="font-family: 'Times New Roman', Times, serif; font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 30px 0;">So, if you have a spare twenty seconds just quickly update your email preferences.</p>
              <a href="https://forestgatetrails.com" style="font-family: 'Times New Roman', Times, serif; font-size: 16px; color: #111; text-decoration: underline; font-style: italic;">Visit our website</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #a8aca1; padding: 30px 20px;">
               <p style="font-family: 'Times New Roman', Times, serif; font-size: 16px; color: #fff; font-style: italic; margin: 0 0 15px 0;">Follow Forest Gate</p>
               <table border="0" cellpadding="0" cellspacing="0" align="center">
                 <tr>
                    <td style="padding: 0 10px;">
                       <a href="#" style="color: #fff; text-decoration: none; font-family: Arial, sans-serif; font-size: 24px;">X</a>
                    </td>
                    <td style="padding: 0 10px;">
                       <a href="#" style="color: #fff; text-decoration: none; font-family: Arial, sans-serif; font-size: 24px;">f</a>
                    </td>
                    <td style="padding: 0 10px;">
                       <a href="#" style="color: #fff; text-decoration: none; font-family: Arial, sans-serif; font-size: 24px;">O</a>
                    </td>
                 </tr>
               </table>
            </td>
          </tr>
        </table>
      </div>
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

    let imageUrl = "https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=600&auto=format&fit=crop";
    
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
             tempFiles.forEach(filePath => {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            });
             return res.status(500).json({
                 message: "Failed to upload image to Cloudinary",
                 error: uploadError.message
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
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 20px auto; border-spacing: 0;">
          <tr>
            <td align="center" style="padding: 40px 20px 20px 20px;">
              <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate Logo" style="width: 180px; margin-bottom: 20px;">
              <h1 style="font-family: 'Times New Roman', Times, serif; font-size: 64px; margin: 0; color: #111;">Forest Gate</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0;">
               <img src="${imageUrl}" alt="Newsletter Image" width="600" style="display: block; width: 100%; max-width: 600px; height: auto;" />
            </td>
          </tr>
          <tr>
            <td align="left" style="padding: 40px 30px;">
              <h2 style="font-family: 'Times New Roman', Times, serif; font-size: 24px; font-weight: bold; color: #111; margin: 0 0 20px 0; text-transform: uppercase;">${subject}</h2>
              <div style="font-family: 'Times New Roman', Times, serif; font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 30px 0;">
                 ${formattedMessage}
              </div>
              <a href="https://forestgatetrails.com" style="font-family: 'Times New Roman', Times, serif; font-size: 16px; color: #111; text-decoration: underline; font-style: italic;">Visit our website</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #a8aca1; padding: 30px 20px;">
               <p style="font-family: 'Times New Roman', Times, serif; font-size: 16px; color: #fff; font-style: italic; margin: 0 0 15px 0;">Follow Forest Gate</p>
               <table border="0" cellpadding="0" cellspacing="0" align="center">
                 <tr>
                    <td style="padding: 0 10px;">
                       <a href="#" style="color: #fff; text-decoration: none; font-family: Arial, sans-serif; font-size: 24px;">X</a>
                    </td>
                    <td style="padding: 0 10px;">
                       <a href="#" style="color: #fff; text-decoration: none; font-family: Arial, sans-serif; font-size: 24px;">f</a>
                    </td>
                    <td style="padding: 0 10px;">
                       <a href="#" style="color: #fff; text-decoration: none; font-family: Arial, sans-serif; font-size: 24px;">O</a>
                    </td>
                 </tr>
               </table>
            </td>
          </tr>
        </table>
      </div>
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
    tempFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });

    return res.status(200).json({
      message: `Newsletter sent successfully to ${users.length} subscribers`,
    });
  } catch (error) {
    // Clean up temporary files upon error
    tempFiles.forEach(filePath => {
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
