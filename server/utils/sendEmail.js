const nodemailer = require("nodemailer");
const ErrorResponse = require("./ErrorResponse");

// Create reusable transporter at module level
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === "465", // true for 465, false for others
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send email utility
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message (used if html is not provided)
 * @param {string} [options.html] - HTML content for the email (optional)
 * @returns {Promise<Object>} - Nodemailer response info
 */
const sendEmail = async ({ email, subject, message, html }) => {
  if (!email || !subject || !message) {
    throw new ErrorResponse("Email, subject, and message are required", 400);
  }

  try {
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: email,
      subject,
      text: message,
      ...(html && { html }),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`[EMAIL SENT] ${subject} → ${email}`);
    return info;
  } catch (err) {
    console.error(`[EMAIL ERROR] ${err.message}`);
    throw new ErrorResponse("Email could not be sent", 500);
  }
};

module.exports = sendEmail;
