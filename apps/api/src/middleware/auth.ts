import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: "INVESTOR" | "FOUNDER" | "ADMIN";
      };
    }
  }
}

// Middleware to verify Supabase JWT token
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "No authentication token provided",
        },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid or expired token",
        },
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email!,
      role:
        (user.user_metadata?.role as "INVESTOR" | "FOUNDER" | "ADMIN") ||
        "INVESTOR",
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      error: {
        code: "AUTH_ERROR",
        message: "Authentication failed",
      },
    });
  }
};

// Middleware to require specific role
export const requireRole = (
  ...roles: Array<"INVESTOR" | "FOUNDER" | "ADMIN">
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions",
        },
      });
    }

    next();
  };
};
