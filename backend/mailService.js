const nodemailer = require('nodemailer');

// ─── Configure Nodemailer Transporter ─────────────────────────────────────────
// Using Gmail SMTP with explicit port to avoid IPv6 issues on Render
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS (not SSL) for better compatibility
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

// ─── Send OTP Email ──────────────────────────────────────────────────────────
const sendOTPEmail = async (email, otp) => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
    throw new Error('Mail configuration is missing. Set MAIL_USER and MAIL_PASSWORD in backend env variables.');
  }
  try {
    // Email HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
            .container { max-width: 500px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { text-align: center; color: #333; }
            .otp-box { 
              background-color: #007bff; 
              color: white; 
              padding: 20px; 
              text-align: center; 
              font-size: 32px; 
              font-weight: bold; 
              border-radius: 8px; 
              margin: 20px 0; 
              letter-spacing: 5px;
            }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
            .warning { color: #d32f2f; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🔐 Lost & Found - OTP Verification</h2>
              <p>Your One-Time Password (OTP)</p>
            </div>
            <p>Hi,</p>
            <p>You requested a One-Time Password (OTP) for your Lost & Found account. Use the code below to verify your email and login:</p>
            <div class="otp-box">${otp}</div>
            <p><strong>Important:</strong></p>
            <ul>
              <li>This OTP is valid for <strong>10 minutes only</strong></li>
              <li>Do not share this OTP with anyone</li>
              <li>If you didn't request this OTP, please ignore this email</li>
            </ul>
            <div class="footer">
              <p class="warning">⚠️ Never share your OTP with anyone, including support staff</p>
              <p>© 2026 Lost & Found. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Email options
    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: email,
      subject: '🔐 Your Lost & Found OTP Verification Code',
      html: htmlContent,
      text: `Your OTP for Lost & Found is: ${otp}\n\nThis OTP is valid for 10 minutes.\nDo not share this code with anyone.`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email} - Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending OTP email to ${email}:`, error.message);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

// ─── Send Welcome Email (Optional) ────────────────────────────────────────────
const sendWelcomeEmail = async (email, userName) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
            .container { max-width: 500px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { text-align: center; color: #333; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>👋 Welcome to Lost & Found</h2>
            </div>
            <p>Hi ${userName},</p>
            <p>Welcome to our Lost & Found platform! Your account has been verified successfully.</p>
            <p>You can now:</p>
            <ul>
              <li>Post lost or found items</li>
              <li>View items in your area</li>
              <li>Chat with other users</li>
              <li>Claim items that belong to you</li>
            </ul>
            <div class="footer">
              <p>© 2026 Lost & Found. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: email,
      subject: '👋 Welcome to Lost & Found',
      html: htmlContent,
      text: `Welcome to Lost & Found, ${userName}! Your account has been verified successfully.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email} - Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${email}:`, error.message);
    // Don't throw error for welcome email as it's not critical
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
};
