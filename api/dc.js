export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Get client IP
    const clientIp = req.headers['x-forwarded-for'] || 
                    req.headers['x-real-ip'] || 
                    req.connection.remoteAddress;
    
    // Clean IP
    const cleanIp = clientIp.replace('::ffff:', '').split(',')[0].trim();
    
    // Get country (simplified version)
    const countryCode = await detectCountry(cleanIp);
    
    // Response
    const response = {
      clientIp: cleanIp,
      [cleanIp]: {
        proxy: "no",
        isocode: countryCode
      }
    };
    
    return res.json(response);

  } catch (error) {
    // Fallback
    return res.json({
      clientIp: '0.0.0.0',
      '0.0.0.0': {
        proxy: "no",
        isocode: "US"
      }
    });
  }
}

async function detectCountry(ip) {
  try {
    // Free IP geolocation API
    const response = await fetch(`https://ipapi.co/${ip}/country_code/`);
    if (response.ok) {
      return await response.text();
    }
  } catch (error) {
    console.error("Country detection error:", error);
  }
  return "US"; // Default
}
