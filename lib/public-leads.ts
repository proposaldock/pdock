import { prisma } from "@/lib/prisma";

export type PublicLeadInput = {
  type: "waitlist" | "contact_sales";
  name: string;
  email: string;
  company: string;
  teamSize?: string;
  plan?: string;
  source?: string;
  message?: string;
};

export async function createPublicLead(input: PublicLeadInput) {
  const now = new Date();

  return prisma.publicLead.create({
    data: {
      id: crypto.randomUUID(),
      type: input.type,
      status: "new",
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      company: input.company.trim(),
      teamSize: input.teamSize?.trim() || null,
      plan: input.plan?.trim() || null,
      source: input.source?.trim() || "marketing_site",
      message: input.message?.trim() || null,
      internalNotes: null,
      assignedUserId: null,
      assignedUserName: null,
      nextFollowUpAt: null,
      activityLog: [
        {
          id: crypto.randomUUID(),
          type: "lead_created",
          title: "Lead created",
          detail: `New ${input.type === "contact_sales" ? "contact sales" : "waitlist"} lead submitted by ${input.name.trim()}.`,
          createdAt: now.toISOString(),
          actorName: input.name.trim(),
        },
      ],
      createdAt: now,
      updatedAt: now,
    },
  });
}
