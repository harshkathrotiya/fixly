/**
 * Test script for email functionality
 */

// Load environment variables from .env file
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const sendEmail = require('./utils/sendEmail');

// Log email configuration for debugging
console.log('Email configuration:', {
  host: process.env.SMTP_HOST || 'NOT SET',
  port: process.env.SMTP_PORT || 'NOT SET',
  auth: {
    user: process.env.SMTP_EMAIL || 'NOT SET',
    // Password masked for security
    pass: process.env.SMTP_PASSWORD ? '********' : 'NOT SET'
  },
  from: `${process.env.FROM_NAME || 'NOT SET'} <${process.env.FROM_EMAIL || 'NOT SET'}>`
});

// Check if required environment variables are set
const missingVars = [];
if (!process.env.SMTP_HOST) missingVars.push('SMTP_HOST');
if (!process.env.SMTP_PORT) missingVars.push('SMTP_PORT');
if (!process.env.SMTP_EMAIL) missingVars.push('SMTP_EMAIL');
if (!process.env.SMTP_PASSWORD) missingVars.push('SMTP_PASSWORD');
if (!process.env.FROM_EMAIL) missingVars.push('FROM_EMAIL');

if (missingVars.length > 0) {
  console.error(`⚠️ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please check your .env file and ensure all required variables are set.');
}

// Test email sending
async function testEmail() {
  try {
    console.log('Testing email sending...');
    
    const result = await sendEmail({
      email: 'test@example.com', // Replace with your test email
      subject: 'Fixly Email Test',
      message: 'This is a test email from Fixly to verify email sending functionality.',
      html: `
        <h1>Fixly Email Test</h1>
        <p>This is a test email from Fixly to verify email sending functionality.</p>
        <p>If you received this email, it means the email configuration is working correctly.</p>
        <p>Time sent: ${new Date().toISOString()}</p>
      `
    });

    console.log('Email sent successfully:', result);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}

// Run the test
testEmail();