import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const VISITOR_COOKIE = "proposaldock_visitor";

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

export async function getOrCreateVisitorId() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const visitorId = crypto.randomUUID();
  cookieStore.set(VISITOR_COOKIE, visitorId, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return visitorId;
}

export async function shouldTrackPageVisit(page: string) {
  const cookieStore = await cookies();
  const key = `proposaldock_track_${page}`;
  const today = todayStamp();
  const lastTracked = cookieStore.get(key)?.value;

  if (lastTracked === today) {
    return false;
  }

  cookieStore.set(key, today, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return true;
}

export async function createMarketingEvent(input: {
  eventType: "landing_visit" | "contact_visit" | "lead_submitted" | "signup_completed";
  page?: string | null;
  path?: string | null;
  visitorId?: string | null;
  email?: string | null;
  plan?: string | null;
}) {
  return prisma.marketingEvent.create({
    data: {
      id: crypto.randomUUID(),
      eventType: input.eventType,
      page: input.page ?? null,
      path: input.path ?? null,
      visitorId: input.visitorId ?? null,
      email: input.email?.trim().toLowerCase() ?? null,
      plan: input.plan ?? null,
      createdAt: new Date(),
    },
  });
}

export async function getMarketingSummary() {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  since.setHours(0, 0, 0, 0);

  const trendDays = Array.from({ length: 30 }, (_, index) => {
    const day = new Date(since);
    day.setDate(since.getDate() + index);
    return day.toISOString().slice(0, 10);
  });

  const [
    totalLandingVisits,
    totalContactVisits,
    totalLeadSubmissions,
    totalSignups,
    recentLandingVisits,
    recentContactVisits,
    recentLeadSubmissions,
    recentSignups,
    convertedLeadUsers,
    totalProLeadSubmissions,
    totalTeamLeadSubmissions,
    totalProSignups,
    totalTeamSignups,
    recentEvents,
  ] = await Promise.all([
    prisma.marketingEvent.count({ where: { eventType: "landing_visit" } }),
    prisma.marketingEvent.count({ where: { eventType: "contact_visit" } }),
    prisma.marketingEvent.count({ where: { eventType: "lead_submitted" } }),
    prisma.marketingEvent.count({ where: { eventType: "signup_completed" } }),
    prisma.marketingEvent.count({
      where: { eventType: "landing_visit", createdAt: { gte: since } },
    }),
    prisma.marketingEvent.count({
      where: { eventType: "contact_visit", createdAt: { gte: since } },
    }),
    prisma.marketingEvent.count({
      where: { eventType: "lead_submitted", createdAt: { gte: since } },
    }),
    prisma.marketingEvent.count({
      where: { eventType: "signup_completed", createdAt: { gte: since } },
    }),
    prisma.user.count({
      where: {
        email: {
          in: (
            await prisma.publicLead.findMany({
              select: { email: true },
              distinct: ["email"],
            })
          ).map((lead) => lead.email),
        },
      },
    }),
    prisma.marketingEvent.count({
      where: { eventType: "lead_submitted", plan: "pro" },
    }),
    prisma.marketingEvent.count({
      where: { eventType: "lead_submitted", plan: "team" },
    }),
    prisma.marketingEvent.count({
      where: { eventType: "signup_completed", plan: "pro" },
    }),
    prisma.marketingEvent.count({
      where: { eventType: "signup_completed", plan: "team" },
    }),
    prisma.marketingEvent.findMany({
      where: {
        createdAt: { gte: since },
        eventType: {
          in: ["landing_visit", "lead_submitted", "signup_completed"],
        },
      },
      select: {
        eventType: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
  ]);

  const trendMap = new Map(
    trendDays.map((day) => [
      day,
      {
        date: day,
        landingVisits: 0,
        leadSubmissions: 0,
        signups: 0,
      },
    ]),
  );

  for (const event of recentEvents) {
    const day = event.createdAt.toISOString().slice(0, 10);
    const bucket = trendMap.get(day);
    if (!bucket) continue;

    if (event.eventType === "landing_visit") bucket.landingVisits += 1;
    if (event.eventType === "lead_submitted") bucket.leadSubmissions += 1;
    if (event.eventType === "signup_completed") bucket.signups += 1;
  }

  return {
    totalLandingVisits,
    totalContactVisits,
    totalLeadSubmissions,
    totalSignups,
    recentLandingVisits,
    recentContactVisits,
    recentLeadSubmissions,
    recentSignups,
    convertedLeadUsers,
    totalProLeadSubmissions,
    totalTeamLeadSubmissions,
    totalProSignups,
    totalTeamSignups,
    trends: [...trendMap.values()],
    leadToSignupConversionRate:
      totalLeadSubmissions > 0
        ? Math.round((convertedLeadUsers / totalLeadSubmissions) * 100)
        : 0,
  };
}
