export const config = {
  runtime: "nodejs",
};

import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    let clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      req.socket?.remoteAddress ||
      "0.0.0.0";

    const cleanIp = clientIp.replace("::ffff:", "").trim();

    let isocode = "US"; 
    let blocked = false;

    try {
      const geoRes = await fetch(`https://ipapi.co/${cleanIp}/country_code/`);
      if (geoRes.ok) {
        const country = (await geoRes.text()).trim();
        if (country) {
          isocode = country.toUpperCase();
          if (isocode === "PK") blocked = true;  // BLOCK Pakistan
        }
      }
    } catch {}

    const result = {
      clientIp: cleanIp,
      [cleanIp]: {
        proxy: "no",
        isocode: isocode,
        blocked: blocked,
      },
    };

    return res.status(200).json(result);
  } catch {
    return res.status(200).json({
      clientIp: "0.0.0.0",
      "0.0.0.0": { proxy: "no", isocode: "US", blocked: false },
    });
  }
}
