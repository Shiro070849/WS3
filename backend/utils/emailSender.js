const nodemailer = require('nodemailer');
const { decrypt } = require('./encryption');

/**
 * Email Sender Utility
 * ใช้ส่งเมลผ่าน SMTP ที่ตั้งค่าไว้ใน Database
 */
class EmailSender {
  /**
   * ส่งเมล
   * @param {Object} smtpConfig - SMTP configuration from database
   * @param {Object} mailOptions - Email options
   * @returns {Promise<Object>} - Result with messageId
   */
  static async sendEmail(smtpConfig, mailOptions) {
    try {
      // Validate SMTP config
      if (!smtpConfig || !smtpConfig.smtpHost || !smtpConfig.smtpUsername) {
        throw new Error('SMTP configuration is incomplete');
      }

      // Decrypt password
      const decryptedPassword = decrypt(smtpConfig.smtpPassword);

      console.log('[EMAIL] Creating transporter...');
      console.log('[EMAIL] Host:', smtpConfig.smtpHost);
      console.log('[EMAIL] Port:', smtpConfig.smtpPort);
      console.log('[EMAIL] Username:', smtpConfig.smtpUsername);

      // Create transporter
      const transporter = nodemailer.createTransport({
        host: smtpConfig.smtpHost,
        port: parseInt(smtpConfig.smtpPort) || 587,
        secure: smtpConfig.smtpSecure === 'true' || smtpConfig.smtpSecure === true,
        auth: {
          user: smtpConfig.smtpUsername,
          pass: decryptedPassword
        }
      });

      // Verify connection
      console.log('[EMAIL] Verifying connection...');
      await transporter.verify();
      console.log('[EMAIL] Connection verified successfully');

      // Prepare email
      const emailData = {
        from: `"${smtpConfig.fromName || 'Smart Security System'}" <${smtpConfig.fromEmail || smtpConfig.smtpUsername}>`,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html || mailOptions.text
      };

      console.log('[EMAIL] Sending email to:', mailOptions.to);

      // Send email
      const result = await transporter.sendMail(emailData);

      console.log('[EMAIL] Email sent successfully');
      console.log('[EMAIL] Message ID:', result.messageId);

      return {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      };

    } catch (error) {
      console.error('[EMAIL] Send failed:', error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * ส่งเมลทดสอบ
   * @param {Object} smtpConfig - SMTP configuration
   * @param {string} testEmail - Email to send test to
   * @returns {Promise<Object>}
   */
  static async sendTestEmail(smtpConfig, testEmail) {
    const mailOptions = {
      to: testEmail,
      subject: 'Test Email from Smart Security System',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">Email Configuration Test</h1>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Your email configuration is working correctly!
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This is a test email sent from <strong>Smart Security System</strong>
            </p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999;">
                SMTP Server: ${smtpConfig.smtpHost}<br>
                From: ${smtpConfig.fromEmail || smtpConfig.smtpUsername}<br>
                Sent at: ${new Date().toLocaleString('th-TH')}
              </p>
            </div>
          </div>
        </div>
      `
    };

    return await this.sendEmail(smtpConfig, mailOptions);
  }
}

module.exports = EmailSender;
