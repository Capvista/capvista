import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const telemetryMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const responseTimeMs = Date.now() - start;

    prisma.apiRequestLog
      .create({
        data: {
          method: req.method,
          path: req.originalUrl || req.path,
          statusCode: res.statusCode,
          responseTimeMs,
          userId: req.user?.id || null,
          userRole: req.user?.role || null,
          userAgent: req.headers["user-agent"] || null,
          ipAddress:
            (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
            req.ip ||
            null,
          errorMessage:
            res.statusCode >= 400
              ? res.statusMessage || `HTTP ${res.statusCode}`
              : null,
        },
      })
      .catch((e) => {
        console.error("Telemetry log error:", e);
      });
  });

  next();
};
