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
    const contact = await ContactUs.find().sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Contacts fetched successfully",
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
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 20px auto; border-spacing: 0;">
                <tr>
                    <td align="center" style="padding: 40px 20px 20px 20px;">
                        <h1 style="font-family: 'Times New Roman', Times, serif; font-size: 64px; margin: 0; color: #111;">Forest Gate</h1>
                    </td>
                </tr>
                <tr>
                    <td align="left" style="padding: 40px 30px;">
                        <h2 style="font-family: 'Times New Roman', Times, serif; font-size: 24px; font-weight: bold; color: #111; margin: 0 0 20px 0; text-transform: uppercase;">Reply: ${subject}</h2>
                        <p style="font-family: 'Times New Roman', Times, serif; font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 10px 0;">Hello ${contact.fullName},</p>
                        <div style="font-family: 'Times New Roman', Times, serif; font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 30px 0;">
                            ${formattedMessage}
                        </div>
                        <p style="font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #888; border-left: 3px solid #ccc; padding-left: 10px; margin: 30px 0 30px 0; font-style: italic;">
                            <strong>Your Original Message:</strong><br/>
                            ${contact.message.replace(/\n/g, "<br />")}
                        </p>
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
