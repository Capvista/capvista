import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

async function runHealthChecks() {
  const checks: Record<string, { status: string; responseMs: number }> = {};

  // API check
  checks.api = { status: "up", responseMs: 0 };

  // Database check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "up", responseMs: Date.now() - dbStart };
  } catch {
    checks.database = { status: "down", responseMs: Date.now() - dbStart };
  }

  // Supabase check
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaStart = Date.now();
  if (supabaseUrl) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });
      checks.supabase = {
        status: res.ok || res.status === 400 ? "up" : "degraded",
        responseMs: Date.now() - supaStart,
      };
    } catch {
      checks.supabase = { status: "down", responseMs: Date.now() - supaStart };
    }
  } else {
    checks.supabase = { status: "unknown", responseMs: 0 };
  }

  const overallStatus = Object.values(checks).every((c) => c.status === "up")
    ? "healthy"
    : Object.values(checks).some((c) => c.status === "down")
      ? "unhealthy"
      : "degraded";

  return { overallStatus, checks };
}

// GET /api/health — Public health check
router.get("/", async (_req: Request, res: Response) => {
  try {
    const { overallStatus, checks } = await runHealthChecks();

    return res.status(overallStatus === "unhealthy" ? 503 : 200).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    });
  } catch (error) {
    return res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: "Health check failed",
    });
  }
});

// Self-check: log health to SystemHealthCheck every 5 minutes
export function startHealthCheckInterval() {
  const FIVE_MINUTES = 5 * 60 * 1000;

  setInterval(async () => {
    try {
      const { checks } = await runHealthChecks();

      const entries = Object.entries(checks).map(([service, data]) =>
        prisma.systemHealthCheck.create({
          data: {
            service,
            status: data.status,
            responseTimeMs: data.responseMs,
          },
        })
      );

      await Promise.all(entries);
    } catch (e) {
      console.error("Health check interval error:", e);
    }
  }, FIVE_MINUTES);
}

export default router;
