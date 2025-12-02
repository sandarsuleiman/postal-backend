export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // Vercel provides real country automatically
    const countryCode = req.headers["x-vercel-ip-country"] || "US";

    // Get client IP
    const clientIp =
      (req.headers["x-forwarded-for"] || "").split(",")[0] ||
      req.headers["x-real-ip"] ||
      req.socket?.remoteAddress ||
      "0.0.0.0";

    // Pakistan users blocked
    const blocked = countryCode === "PK";

    // Proxy detection default
    const proxy = "no";

    const result = {
      clientIp,
      [clientIp]: {
        proxy,
        isocode: countryCode,
        blocked,
      },
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error:", err);
    return res.status(200).json({
      clientIp: "0.0.0.0",
      "0.0.0.0": { proxy: "no", isocode: "US", blocked: false },
    });
  }
}
