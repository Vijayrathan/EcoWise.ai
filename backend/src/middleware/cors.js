/**
 * CORS Middleware
 *
 * Explicit CORS handling for Cloud Run compatibility.
 * This middleware handles preflight requests and sets all necessary CORS headers.
 */

const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  // Log CORS requests in development
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[CORS] Request from origin: ${origin || "none"}, Method: ${req.method}`
    );
  }

  // Allow all origins (can be restricted via CLIENT_ORIGINS env var if needed)
  const allowedOrigins = process.env.CLIENT_ORIGINS
    ? process.env.CLIENT_ORIGINS.split(",").map((o) => o.trim())
    : null;

  if (allowedOrigins && origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (origin) {
    // Allow the requesting origin
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // No origin header (e.g., curl, Postman)
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  // Set CORS headers
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Expose-Headers", "Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours

  // Handle preflight requests (OPTIONS)
  if (req.method === "OPTIONS") {
    if (process.env.NODE_ENV === "development") {
      console.log(`[CORS] Handling preflight request for ${req.path}`);
    }
    return res.status(204).end();
  }

  next();
};

module.exports = corsMiddleware;
