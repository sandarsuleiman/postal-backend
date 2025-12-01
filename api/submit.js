import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ser, us, emails, workerEmail, name } = req.body;

    console.log('📨 Processing submission...');
    console.log('Data:', { ser, us, emails, workerEmail, name });

    // ✅ Step 1: Email send karenge
    const emailResult = await sendGmail(emails, workerEmail, {
      ser, us, name
    });

    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully!',
      emailSent: emailResult.success,
      emailMessage: emailResult.message
    });

  } catch (error) {
    console.error('❌ Server Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
}

// Gmail Send Function
async function sendGmail(toEmails, ccEmail, formData) {
  try {
    // Gmail Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,    // Your Gmail address
        pass: process.env.GMAIL_APP_PASS // App password (16-digit)
      }
    });

    // Email Content
    const mailOptions = {
      from: `"Form System" <${process.env.GMAIL_USER}>`,
      to: toEmails.join(', '),      // All emails in array
      cc: ccEmail,                  // Worker email
      subject: `✅ New Submission: ${formData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">📋 New Form Submission Received</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #555;">📝 Submission Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formData.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">ser:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formData.ser}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">us:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${formData.us}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Worker Email:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${ccEmail}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Time:</td>
                <td style="padding: 10px;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #666;">This is an automated email from your form system.</p>
        </div>
      `,
      text: `New Form Submission\n\nName: ${formData.name}\nser: ${formData.ser}\nus: ${formData.us}\nWorker: ${ccEmail}\nTime: ${new Date().toLocaleString()}`
    };

    // Send Email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('To:', toEmails);
    console.log('CC:', ccEmail);

    return {
      success: true,
      message: 'Email sent successfully!',
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Email Error:', error);
    return {
      success: false,
      message: 'Email sending failed: ' + error.message
    };
  }
}
