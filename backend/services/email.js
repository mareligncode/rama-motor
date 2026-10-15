import nodemailer from 'nodemailer';

/**
 * Creates reusable Nodemailer transporter instance
 */
function createTransporter() {
  const service = process.env.EMAIL_SERVICE || 'gmail';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass || pass === 'your-16-digit-app-password') {
    return null;
  }

  return nodemailer.createTransport({
    service,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends an email
 * @param {object} params
 * @param {string|string[]} params.to - Recipient email address(es)
 * @param {string} params.subject - Email subject
 * @param {string} [params.text] - Plain text body
 * @param {string} [params.html] - HTML body
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
export async function sendEmail({ to, subject, text, html }) {
  try {
    const transporter = createTransporter();
    const from = process.env.EMAIL_FROM || `"Rama Motor Delivery" <${process.env.EMAIL_USER || 'no-reply@ramamotor.com'}>`;

    if (!transporter) {
      console.warn(
        `[Email Service] Warning: EMAIL_USER or EMAIL_PASS not configured. [MOCK EMAIL] To: ${to}, Subject: "${subject}"`
      );
      return {
        success: true,
        messageId: `mock_email_${Date.now()}`,
      };
    }

    const mailOptions = {
      from,
      to,
      subject,
      text: text || '',
      html: html || (text ? `<p>${text}</p>` : ''),
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(`[Email Service Error] To: ${to} - ${error.message}`);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

export default {
  sendEmail,
};
