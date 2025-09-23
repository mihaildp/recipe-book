const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Check if email service is configured
    const hasEmailConfig = (
      (process.env.NODE_ENV === 'production' && process.env.SENDGRID_USERNAME && process.env.SENDGRID_PASSWORD) ||
      (process.env.NODE_ENV !== 'production' && process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD)
    );
    
    if (!hasEmailConfig) {
      console.log(`⚠️ Email service not configured - would send: ${subject} to ${to}`);
      throw new Error('Email service not configured');
    }
    
    // Create transporter based on environment
    let transporter;
    
    if (process.env.NODE_ENV === 'production') {
      // Production email service (e.g., SendGrid, AWS SES)
      transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    } else {
      // Development - Use Gmail or Mailtrap
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD // Use App Password for Gmail
        }
      });
    }
    
    // Email options
    const mailOptions = {
      from: `Recipe Book <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, '') // Strip HTML for text version
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

module.exports = sendEmail;
