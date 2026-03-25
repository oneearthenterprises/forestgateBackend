import ContactUs from "../models/contactus.js";
import nodemailer from "nodemailer";

const createContext = async (req, res) => {
  try {
    const { fullName, email, message } = req.body;
    if (!fullName || !email || !message) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }
    const contact = await ContactUs.create({
      fullName,
      email,
      message,
    });
    return res.status(201).json({
      message: "Contact created successfully",
      contact,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL MESSAGES (Admin)
const getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await ContactUs.countDocuments();
    const contact = await ContactUs.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      message: "Contacts fetched successfully",
      total,
      page,
      totalPages: Math.ceil(total / limit),
      contact,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// REPLY TO MESSAGE (Admin)
const replyToContact = async (req, res) => {
  try {
    const { contactId, replyMessage, subject } = req.body;

    if (!contactId || !replyMessage || !subject) {
      return res.status(400).json({
        message: "Contact ID, Subject, and Reply Message are required",
      });
    }

    const contact = await ContactUs.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        message: "Contact message not found",
      });
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

    const formattedMessage = replyMessage
      ? replyMessage.replace(/\n/g, "<br />")
      : "";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap');
          body { margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Inter', Arial, sans-serif; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
          .header { padding: 40px; text-align: center; background-color: #ffffff; }
          .logo { width: 140px; margin-bottom: 8px; }
          .content { padding: 48px 40px; text-align: left; }
          .title-text { font-family: 'Times New Roman', serif; font-size: 28px; font-weight: bold; color: #085d6b; margin: 0 0 24px 0; text-transform: uppercase; letter-spacing: 1px; }
          .body-text { font-family: 'Times New Roman', serif; font-size: 18px; line-height: 1.8; color: #334155; margin-bottom: 32px; }
          .original-msg { background-color: #f1f5f9; padding: 24px; border-radius: 12px; font-size: 14px; color: #64748b; line-height: 1.6; font-style: italic; margin-bottom: 32px; }
          .footer { background-color: #085d6b; padding: 48px 40px; text-align: center; color: #ffffff; }
          .cta-link { display: inline-block; font-family: 'Times New Roman', serif; font-size: 16px; color: #085d6b; text-decoration: underline; font-style: italic; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/djglckvn7/image/upload/v1773398383/forest_agte_123345_1_1_kix8vd.svg" alt="Forest Gate" class="logo">
          </div>
          <div class="content">
            <h2 class="title-text">Re: ${subject}</h2>
            <p class="body-text">Hello ${contact.fullName},</p>
            <div class="body-text">
               ${formattedMessage}
            </div>
            <div class="original-msg">
              <strong>Your Original Message:</strong><br/>
              ${contact.message.replace(/\n/g, "<br />")}
            </div>
            <a href="${process.env.FRONTEND_URL || "http://localhost:9003"}" class="cta-link">Visit our website</a>
          </div>
          <div class="footer">
            <p style="font-family: 'Times New Roman', serif; font-size: 18px; font-style: italic; opacity: 0.9;">Forest Gate Sanctuary</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"ForestGate Support" <${process.env.EMAIL_USER}>`,
      to: contact.email,
      subject: `Re: ${subject}`,
      text: replyMessage,
      html: emailHtml,
    });

    // Optionally update the contact to mark as replied
    // contact.status = 'replied';
    // await contact.save();

    return res.status(200).json({
      message: "Reply sent successfully",
    });
  } catch (error) {
    console.error("Reply sending error:", error);
    res.status(500).json({
      message: "Failed to send reply email",
    });
  }
};

export { createContext, getAllContacts, replyToContact };
