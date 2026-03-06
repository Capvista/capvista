import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { Prisma } from "@prisma/client";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

// Helper: get date range from period string
function getDateRange(period: string): Date {
  const now = new Date();
  switch (period) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

// ============================================================================
// GET /api/admin/telemetry/overview
// ============================================================================
router.get("/overview", async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      requestsToday,
      requestsWeek,
      requestsMonth,
      avgResponseToday,
      errorsToday,
      totalToday,
      activeUsersToday,
    ] = await Promise.all([
      prisma.apiRequestLog.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.apiRequestLog.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.apiRequestLog.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.apiRequestLog.aggregate({
        where: { createdAt: { gte: todayStart } },
        _avg: { responseTimeMs: true },
      }),
      prisma.apiRequestLog.count({
        where: { createdAt: { gte: todayStart }, statusCode: { gte: 400 } },
      }),
      prisma.apiRequestLog.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.apiRequestLog.findMany({
        where: { createdAt: { gte: todayStart }, userId: { not: null } },
        distinct: ["userId"],
        select: { userId: true },
      }),
    ]);

    // Requests per hour for last 24 hours
    const hourlyRequests = await prisma.$queryRaw<
      Array<{ hour: Date; count: bigint }>
    >`
      SELECT date_trunc('hour', "createdAt") as hour, COUNT(*)::bigint as count
      FROM "ApiRequestLog"
      WHERE "createdAt" >= ${yesterday}
      GROUP BY hour
      ORDER BY hour ASC
    `;

    return res.json({
      success: true,
      data: {
        requestsToday,
        requestsWeek,
        requestsMonth,
        avgResponseTimeMs: Math.round(avgResponseToday._avg.responseTimeMs || 0),
        errorRate: totalToday > 0 ? Math.round((errorsToday / totalToday) * 10000) / 100 : 0,
        activeUsersToday: activeUsersToday.length,
        requestsPerHour: hourlyRequests.map((r) => ({
          hour: r.hour,
          count: Number(r.count),
        })),
      },
    });
  } catch (error) {
    console.error("Telemetry overview error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch telemetry overview" },
    });
  }
});

// ============================================================================
// GET /api/admin/telemetry/requests
// ============================================================================
router.get("/requests", async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || "24h";
    const pathFilter = req.query.path as string | undefined;
    const statusFilter = req.query.status
      ? parseInt(req.query.status as string)
      : undefined;
    const since = getDateRange(period);

    const where: Prisma.ApiRequestLogWhereInput = {
      createdAt: { gte: since },
      ...(pathFilter && { path: { contains: pathFilter } }),
      ...(statusFilter && { statusCode: statusFilter }),
    };

    const [
      totalRequests,
      topEndpoints,
      slowestEndpoints,
      errorBreakdown,
    ] = await Promise.all([
      prisma.apiRequestLog.count({ where }),
      prisma.$queryRaw<Array<{ path: string; count: bigint }>>`
        SELECT path, COUNT(*)::bigint as count
        FROM "ApiRequestLog"
        WHERE "createdAt" >= ${since}
        ${pathFilter ? Prisma.sql`AND path LIKE ${'%' + pathFilter + '%'}` : Prisma.empty}
        GROUP BY path
        ORDER BY count DESC
        LIMIT 20
      `,
      prisma.$queryRaw<Array<{ path: string; avg_ms: number }>>`
        SELECT path, AVG("responseTimeMs")::float as avg_ms
        FROM "ApiRequestLog"
        WHERE "createdAt" >= ${since}
        GROUP BY path
        ORDER BY avg_ms DESC
        LIMIT 20
      `,
      prisma.$queryRaw<Array<{ path: string; status_code: number; count: bigint }>>`
        SELECT path, "statusCode" as status_code, COUNT(*)::bigint as count
        FROM "ApiRequestLog"
        WHERE "createdAt" >= ${since} AND "statusCode" >= 400
        GROUP BY path, "statusCode"
        ORDER BY count DESC
        LIMIT 30
      `,
    ]);

    return res.json({
      success: true,
      data: {
        totalRequests,
        topEndpoints: topEndpoints.map((e) => ({
          path: e.path,
          count: Number(e.count),
        })),
        slowestEndpoints: slowestEndpoints.map((e) => ({
          path: e.path,
          avgMs: Math.round(e.avg_ms),
        })),
        errorBreakdown: errorBreakdown.map((e) => ({
          path: e.path,
          statusCode: e.status_code,
          count: Number(e.count),
        })),
      },
    });
  } catch (error) {
    console.error("Telemetry requests error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch request analytics" },
    });
  }
});

// ============================================================================
// GET /api/admin/telemetry/events
// ============================================================================
router.get("/events", async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || "7d";
    const category = req.query.category as string | undefined;
    const eventType = req.query.eventType as string | undefined;
    const since = getDateRange(period);

    const where: Prisma.PlatformEventWhereInput = {
      createdAt: { gte: since },
      ...(category && { category }),
      ...(eventType && { eventType }),
    };

    const [eventCounts, recentEvents] = await Promise.all([
      prisma.$queryRaw<Array<{ event_type: string; category: string; count: bigint }>>`
        SELECT "eventType" as event_type, category, COUNT(*)::bigint as count
        FROM "PlatformEvent"
        WHERE "createdAt" >= ${since}
        ${category ? Prisma.sql`AND category = ${category}` : Prisma.empty}
        ${eventType ? Prisma.sql`AND "eventType" = ${eventType}` : Prisma.empty}
        GROUP BY "eventType", category
        ORDER BY count DESC
      `,
      prisma.platformEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        eventCounts: eventCounts.map((e) => ({
          eventType: e.event_type,
          category: e.category,
          count: Number(e.count),
        })),
        recentEvents,
      },
    });
  } catch (error) {
    console.error("Telemetry events error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch event analytics" },
    });
  }
});

// ============================================================================
// GET /api/admin/telemetry/users
// ============================================================================
router.get("/users", async (_req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = getDateRange("30d");
    const sevenDaysAgo = getDateRange("7d");
    const fourteenDaysAgo = getDateRange("14d");

    const [signupsPerDay, activePerDay, thisWeekUsers, lastWeekUsers, topUsers] =
      await Promise.all([
        // Signups per day (last 30d)
        prisma.$queryRaw<Array<{ day: Date; role: string; count: bigint }>>`
          SELECT date_trunc('day', "createdAt") as day, role, COUNT(*)::bigint as count
          FROM "User"
          WHERE "createdAt" >= ${thirtyDaysAgo}
          GROUP BY day, role
          ORDER BY day ASC
        `,
        // Active users per day (last 30d)
        prisma.$queryRaw<Array<{ day: Date; user_role: string; count: bigint }>>`
          SELECT date_trunc('day', "createdAt") as day, "userRole" as user_role, COUNT(DISTINCT "userId")::bigint as count
          FROM "ApiRequestLog"
          WHERE "createdAt" >= ${thirtyDaysAgo} AND "userId" IS NOT NULL
          GROUP BY day, "userRole"
          ORDER BY day ASC
        `,
        // This week unique users
        prisma.apiRequestLog.findMany({
          where: { createdAt: { gte: sevenDaysAgo }, userId: { not: null } },
          distinct: ["userId"],
          select: { userId: true },
        }),
        // Last week unique users (7-14 days ago)
        prisma.apiRequestLog.findMany({
          where: {
            createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
            userId: { not: null },
          },
          distinct: ["userId"],
          select: { userId: true },
        }),
        // Top users by activity
        prisma.$queryRaw<Array<{ user_id: string; user_role: string; count: bigint }>>`
          SELECT "userId" as user_id, "userRole" as user_role, COUNT(*)::bigint as count
          FROM "ApiRequestLog"
          WHERE "createdAt" >= ${thirtyDaysAgo} AND "userId" IS NOT NULL
          GROUP BY "userId", "userRole"
          ORDER BY count DESC
          LIMIT 20
        `,
      ]);

    // Retention: users who logged in both weeks
    const thisWeekSet = new Set(thisWeekUsers.map((u) => u.userId));
    const lastWeekSet = new Set(lastWeekUsers.map((u) => u.userId));
    const retained = [...lastWeekSet].filter((id) => thisWeekSet.has(id!));
    const retentionRate =
      lastWeekSet.size > 0
        ? Math.round((retained.length / lastWeekSet.size) * 10000) / 100
        : 0;

    return res.json({
      success: true,
      data: {
        signupsPerDay: signupsPerDay.map((s) => ({
          day: s.day,
          role: s.role,
          count: Number(s.count),
        })),
        activePerDay: activePerDay.map((a) => ({
          day: a.day,
          role: a.user_role,
          count: Number(a.count),
        })),
        retention: {
          thisWeek: thisWeekSet.size,
          lastWeek: lastWeekSet.size,
          retained: retained.length,
          retentionRate,
        },
        topUsers: topUsers.map((u) => ({
          userId: u.user_id,
          role: u.user_role,
          requestCount: Number(u.count),
        })),
      },
    });
  } catch (error) {
    console.error("Telemetry users error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch user analytics" },
    });
  }
});

// ============================================================================
// GET /api/admin/telemetry/business
// ============================================================================
router.get("/business", async (_req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = getDateRange("30d");

    const [
      companyCounts,
      dealCounts,
      investmentCounts,
      totalWatchlists,
      mostWatchlisted,
    ] = await Promise.all([
      prisma.$queryRaw<Array<{ event_type: string; count: bigint }>>`
        SELECT "eventType" as event_type, COUNT(*)::bigint as count
        FROM "PlatformEvent"
        WHERE category = 'company' AND "createdAt" >= ${thirtyDaysAgo}
        GROUP BY "eventType"
      `,
      prisma.$queryRaw<Array<{ event_type: string; count: bigint }>>`
        SELECT "eventType" as event_type, COUNT(*)::bigint as count
        FROM "PlatformEvent"
        WHERE category = 'deal' AND "createdAt" >= ${thirtyDaysAgo}
        GROUP BY "eventType"
      `,
      prisma.$queryRaw<Array<{ event_type: string; count: bigint }>>`
        SELECT "eventType" as event_type, COUNT(*)::bigint as count
        FROM "PlatformEvent"
        WHERE category = 'investment' AND "createdAt" >= ${thirtyDaysAgo}
        GROUP BY "eventType"
      `,
      prisma.watchlist.count(),
      prisma.$queryRaw<Array<{ company_id: string; count: bigint }>>`
        SELECT "companyId" as company_id, COUNT(*)::bigint as count
        FROM "Watchlist"
        GROUP BY "companyId"
        ORDER BY count DESC
        LIMIT 10
      `,
    ]);

    return res.json({
      success: true,
      data: {
        companies: companyCounts.map((c) => ({
          event: c.event_type,
          count: Number(c.count),
        })),
        deals: dealCounts.map((d) => ({
          event: d.event_type,
          count: Number(d.count),
        })),
        investments: investmentCounts.map((i) => ({
          event: i.event_type,
          count: Number(i.count),
        })),
        watchlist: {
          total: totalWatchlists,
          mostWatchlisted: mostWatchlisted.map((w) => ({
            companyId: w.company_id,
            count: Number(w.count),
          })),
        },
      },
    });
  } catch (error) {
    console.error("Telemetry business error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch business metrics" },
    });
  }
});

// ============================================================================
// GET /api/admin/telemetry/health
// ============================================================================
router.get("/health", async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = getDateRange("24h");
    const sevenDaysAgo = getDateRange("7d");
    const thirtyDaysAgo = getDateRange("30d");

    const [recentChecks, uptime24h, uptime7d, uptime30d, avgResponseTimes] =
      await Promise.all([
        prisma.systemHealthCheck.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.systemHealthCheck.findMany({
          where: { createdAt: { gte: twentyFourHoursAgo }, service: "database" },
          select: { status: true },
        }),
        prisma.systemHealthCheck.findMany({
          where: { createdAt: { gte: sevenDaysAgo }, service: "database" },
          select: { status: true },
        }),
        prisma.systemHealthCheck.findMany({
          where: { createdAt: { gte: thirtyDaysAgo }, service: "database" },
          select: { status: true },
        }),
        prisma.$queryRaw<Array<{ day: Date; avg_ms: number }>>`
          SELECT date_trunc('day', "createdAt") as day, AVG("responseTimeMs")::float as avg_ms
          FROM "ApiRequestLog"
          WHERE "createdAt" >= ${thirtyDaysAgo}
          GROUP BY day
          ORDER BY day ASC
        `,
      ]);

    const calcUptime = (checks: Array<{ status: string }>) => {
      if (checks.length === 0) return 100;
      const up = checks.filter((c) => c.status === "up").length;
      return Math.round((up / checks.length) * 10000) / 100;
    };

    return res.json({
      success: true,
      data: {
        currentChecks: recentChecks,
        uptime: {
          "24h": calcUptime(uptime24h),
          "7d": calcUptime(uptime7d),
          "30d": calcUptime(uptime30d),
        },
        avgResponseTimes: avgResponseTimes.map((a) => ({
          day: a.day,
          avgMs: Math.round(a.avg_ms),
        })),
      },
    });
  } catch (error) {
    console.error("Telemetry health error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch health metrics" },
    });
  }
});

// ============================================================================
// GET /api/admin/telemetry/errors
// ============================================================================
router.get("/errors", async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || "7d";
    const since = getDateRange(period);

    const [recentErrors, errorRateOverTime, topErrorEndpoints, statusBreakdown] =
      await Promise.all([
        prisma.apiRequestLog.findMany({
          where: { statusCode: { gte: 400 }, createdAt: { gte: since } },
          orderBy: { createdAt: "desc" },
          take: 100,
          select: {
            id: true,
            method: true,
            path: true,
            statusCode: true,
            errorMessage: true,
            userId: true,
            userRole: true,
            createdAt: true,
          },
        }),
        prisma.$queryRaw<Array<{ day: Date; total: bigint; errors: bigint }>>`
          SELECT
            date_trunc('day', "createdAt") as day,
            COUNT(*)::bigint as total,
            COUNT(*) FILTER (WHERE "statusCode" >= 400)::bigint as errors
          FROM "ApiRequestLog"
          WHERE "createdAt" >= ${since}
          GROUP BY day
          ORDER BY day ASC
        `,
        prisma.$queryRaw<Array<{ path: string; count: bigint }>>`
          SELECT path, COUNT(*)::bigint as count
          FROM "ApiRequestLog"
          WHERE "statusCode" >= 400 AND "createdAt" >= ${since}
          GROUP BY path
          ORDER BY count DESC
          LIMIT 20
        `,
        prisma.$queryRaw<Array<{ status_code: number; count: bigint }>>`
          SELECT "statusCode" as status_code, COUNT(*)::bigint as count
          FROM "ApiRequestLog"
          WHERE "statusCode" >= 400 AND "createdAt" >= ${since}
          GROUP BY "statusCode"
          ORDER BY status_code ASC
        `,
      ]);

    return res.json({
      success: true,
      data: {
        recentErrors,
        errorRateOverTime: errorRateOverTime.map((e) => ({
          day: e.day,
          total: Number(e.total),
          errors: Number(e.errors),
          rate:
            Number(e.total) > 0
              ? Math.round((Number(e.errors) / Number(e.total)) * 10000) / 100
              : 0,
        })),
        topErrorEndpoints: topErrorEndpoints.map((e) => ({
          path: e.path,
          count: Number(e.count),
        })),
        statusBreakdown: statusBreakdown.map((s) => ({
          statusCode: s.status_code,
          count: Number(s.count),
        })),
      },
    });
  } catch (error) {
    console.error("Telemetry errors error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch error analytics" },
    });
  }
});

// ============================================================================
// Data Retention: DELETE /api/admin/telemetry/cleanup
// ============================================================================
router.delete("/cleanup", async (_req: Request, res: Response) => {
  try {
    const ninetyDaysAgo = getDateRange("90d");

    const [deletedLogs, deletedHealthChecks] = await Promise.all([
      prisma.apiRequestLog.deleteMany({
        where: { createdAt: { lt: ninetyDaysAgo } },
      }),
      prisma.systemHealthCheck.deleteMany({
        where: { createdAt: { lt: ninetyDaysAgo } },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        deletedRequestLogs: deletedLogs.count,
        deletedHealthChecks: deletedHealthChecks.count,
      },
    });
  } catch (error) {
    console.error("Telemetry cleanup error:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to run cleanup" },
    });
  }
});

// Auto-cleanup: runs daily via setInterval
export function startDataRetentionInterval() {
  const ONE_DAY = 24 * 60 * 60 * 1000;

  setInterval(async () => {
    try {
      const ninetyDaysAgo = new Date(Date.now() - 90 * ONE_DAY);

      const [logs, health] = await Promise.all([
        prisma.apiRequestLog.deleteMany({
          where: { createdAt: { lt: ninetyDaysAgo } },
        }),
        prisma.systemHealthCheck.deleteMany({
          where: { createdAt: { lt: ninetyDaysAgo } },
        }),
      ]);

      if (logs.count > 0 || health.count > 0) {
        console.log(
          `Telemetry cleanup: deleted ${logs.count} request logs, ${health.count} health checks`
        );
      }
    } catch (e) {
      console.error("Data retention cleanup error:", e);
    }
  }, ONE_DAY);
}

export default router;
