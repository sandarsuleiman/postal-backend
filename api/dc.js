// api/dc.js - Real Country Detection
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Get client IP
    let clientIp = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   (req.socket ? req.socket.remoteAddress : '0.0.0.0');
    
    const cleanIp = clientIp.replace('::ffff:', '').split(',')[0].trim();
    
    console.log('🌍 Detecting country for IP:', cleanIp);
    
    // ✅ REAL COUNTRY DETECTION
    let isocode = "US"; // Default
    
    try {
      // Free IP geolocation API
      const response = await fetch(`https://ipapi.co/${cleanIp}/country_code/`);
      if (response.ok) {
        const countryCode = await response.text();
        isocode = countryCode.trim().toUpperCase() || "US";
        console.log('📍 Real country detected:', isocode);
      } else {
        console.log('⚠️ Using default country');
      }
    } catch (apiError) {
      console.log('🌐 API error, using default');
    }
    
    // Response
    const response = {
      clientIp: cleanIp,
      [cleanIp]: {
        proxy: "no",
        isocode: isocode
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(200).json({
      clientIp: '0.0.0.0',
      '0.0.0.0': {
        proxy: "no",
        isocode: "US"
      }
    });
  }
}
