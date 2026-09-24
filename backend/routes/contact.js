const express = require("express");
const router = express.Router();
const ContactMessage = require("../models/ContactMessage");
const nodemailer = require("nodemailer");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// @route   POST /api/contact
// @desc    Submit contact form message
// @access  Public
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (Name, Email, Message).",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Capture IP address if available
    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";

    // Save message to MongoDB
    const newMessage = new ContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject ? subject.trim() : "General Inquiry",
      message: message.trim(),
      ipAddress: ipAddress,
    });

    await newMessage.save();

    // Send email notification if nodemailer credentials exist
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      if (process.env.EMAIL_PASS.includes("your_gmail_app_password")) {
        console.warn(
          "⚠️ Email sending skipped: EMAIL_PASS in backend/.env is still set to placeholder 'your_gmail_app_password_here'. Please replace it with your 16-digit Gmail App Password."
        );
      } else {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: process.env.EMAIL_USER.trim(),
              pass: process.env.EMAIL_PASS.trim(),
            },
            tls: {
              rejectUnauthorized: false,
            },
          });

          const targetEmail = process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER;

          const mailOptions = {
            from: `"XcelFlow Contact" <${process.env.EMAIL_USER.trim()}>`,
            to: targetEmail,
            replyTo: email,
            subject: `[XcelFlow Inquiry] ${subject || "New Message from " + name}`,
            html: `
              <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: #0f172a; padding: 24px; text-align: center;">
                  <h2 style="color: #38bdf8; margin: 0; font-size: 22px;">New Contact Form Message</h2>
                  <p style="color: #94a3b8; margin-top: 4px; font-size: 13px;">XcelFlow Platform Inquiry</p>
                </div>
                <div style="padding: 28px; color: #334155; font-size: 14px; line-height: 1.6;">
                  <p style="margin-bottom: 8px;"><strong>From Name:</strong> ${name}</p>
                  <p style="margin-bottom: 8px;"><strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #0284c7; text-decoration: none;">${email}</a></p>
                  <p style="margin-bottom: 16px;"><strong>Category / Subject:</strong> <span style="background-color: #f0f9ff; color: #0369a1; padding: 3px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">${subject || "General Inquiry"}</span></p>
                  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                  <p style="margin-bottom: 8px; font-weight: 600; color: #0f172a;">Message Content:</p>
                  <div style="white-space: pre-wrap; background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #38bdf8; color: #1e293b; font-size: 14px;">${message}</div>
                </div>
                <div style="background-color: #f8fafc; padding: 14px 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
                  Sent automatically via XcelFlow Contact System
                </div>
              </div>
            `,
          };

          const info = await transporter.sendMail(mailOptions);
          console.log(`✅ Email notification sent successfully to ${targetEmail}. MessageId: ${info.messageId}`);
        } catch (emailErr) {
          console.error("❌ Failed to send email notification:", emailErr.message);
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: "Thank you for reaching out! Your message has been received and our team will get back to you shortly.",
      data: {
        id: newMessage._id,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (err) {
    console.error("Error in contact route:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "An error occurred while submitting your message.",
      error: err.toString()
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages (Admin only)
// @access  Private/Admin
router.get("/", authMiddleware, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (err) {
    console.error("Error fetching contact messages:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   PUT /api/contact/:id/status
// @desc    Update status of contact message
// @access  Private/Admin
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["unread", "read", "replied"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const updated = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error updating contact message status:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete a contact message
// @access  Private/Admin
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }
    return res.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting contact message:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
