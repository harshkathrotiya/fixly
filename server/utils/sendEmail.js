const nodemailer = require('nodemailer');

/**
 * Send email utility
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message (used if html is not provided)
 * @param {string} options.html - HTML content for the email (optional)
 * @returns {Promise} - Nodemailer send result
 */
const sendEmail = async (options) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  // Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // Add HTML content if provided
  if (options.html) {
    mailOptions.html = options.html;
  }

  // Send email
  return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;