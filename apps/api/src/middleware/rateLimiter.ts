import rateLimit from "express-rate-limit";

// General API limiter — 200 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please slow down.",
    },
  },
});

// Auth limiter (strict) — 10 attempts per 15 minutes per IP
// For login, signup, password reset, password change
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many attempts. Please try again in 15 minutes.",
    },
  },
});

// Submission limiter (moderate) — 20 submissions per hour per IP
// For company creation, team members, watchlist, investments
export const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many submissions. Please try again later.",
    },
  },
});
