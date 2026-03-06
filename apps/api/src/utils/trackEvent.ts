import { prisma } from "../lib/prisma";

export async function trackEvent(
  eventType: string,
  category: string,
  userId?: string,
  userRole?: string,
  metadata?: Record<string, any>
) {
  try {
    await prisma.platformEvent.create({
      data: { eventType, category, userId, userRole, metadata },
    });
  } catch (e) {
    console.error("Telemetry event error:", e);
  }
}
