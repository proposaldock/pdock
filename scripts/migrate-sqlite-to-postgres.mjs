import path from "node:path";
import { PrismaClient as SqlitePrismaClient } from "../generated/sqlite-client/index.js";
import { PrismaClient as PostgresPrismaClient } from "@prisma/client";

function resolveSqliteUrl() {
  const explicit = process.env.SQLITE_DATABASE_URL?.trim();
  if (explicit) return explicit;

  const absoluteDbPath = path.join(process.cwd(), "prisma", "dev.db").replace(/\\/g, "/");
  return `file:${absoluteDbPath}`;
}

function getPostgresUrl() {
  const url = process.env.POSTGRES_DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "Missing POSTGRES_DATABASE_URL. Set it to your hosted Postgres connection string and retry.",
    );
  }

  return url;
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function main() {
  const sqlite = new SqlitePrismaClient({
    datasources: {
      db: {
        url: resolveSqliteUrl(),
      },
    },
  });

  const postgres = new PostgresPrismaClient({
    datasources: {
      db: {
        url: getPostgresUrl(),
      },
    },
  });

  try {
    console.log("Reading local SQLite data...");

    const [
      users,
      organizations,
      organizationMemberships,
      workspaces,
      workspaceAccesses,
      knowledgeAssets,
      publicLeads,
      marketingEvents,
    ] = await Promise.all([
      sqlite.user.findMany(),
      sqlite.organization.findMany(),
      sqlite.organizationMembership.findMany(),
      sqlite.workspace.findMany(),
      sqlite.workspaceAccess.findMany(),
      sqlite.knowledgeAsset.findMany(),
      sqlite.publicLead.findMany(),
      sqlite.marketingEvent.findMany(),
    ]);

    console.log("Resetting Postgres tables...");

    await postgres.$transaction([
      postgres.workspaceAccess.deleteMany(),
      postgres.workspace.deleteMany(),
      postgres.knowledgeAsset.deleteMany(),
      postgres.organizationMembership.deleteMany(),
      postgres.organization.deleteMany(),
      postgres.publicLead.deleteMany(),
      postgres.marketingEvent.deleteMany(),
      postgres.user.deleteMany(),
    ]);

    console.log("Writing users, organizations, and memberships...");

    if (users.length) {
      for (const part of chunk(users, 100)) {
        await postgres.user.createMany({ data: part });
      }
    }

    if (organizations.length) {
      for (const part of chunk(organizations, 100)) {
        await postgres.organization.createMany({ data: part });
      }
    }

    if (organizationMemberships.length) {
      for (const part of chunk(organizationMemberships, 100)) {
        await postgres.organizationMembership.createMany({ data: part });
      }
    }

    console.log("Writing workspaces, access records, and knowledge assets...");

    if (workspaces.length) {
      for (const part of chunk(workspaces, 100)) {
        await postgres.workspace.createMany({ data: part });
      }
    }

    if (workspaceAccesses.length) {
      for (const part of chunk(workspaceAccesses, 100)) {
        await postgres.workspaceAccess.createMany({ data: part });
      }
    }

    if (knowledgeAssets.length) {
      for (const part of chunk(knowledgeAssets, 100)) {
        await postgres.knowledgeAsset.createMany({ data: part });
      }
    }

    console.log("Writing leads and marketing events...");

    if (publicLeads.length) {
      for (const part of chunk(publicLeads, 100)) {
        await postgres.publicLead.createMany({ data: part });
      }
    }

    if (marketingEvents.length) {
      for (const part of chunk(marketingEvents, 100)) {
        await postgres.marketingEvent.createMany({ data: part });
      }
    }

    console.log("Migration complete.");
    console.log(
      JSON.stringify(
        {
          users: users.length,
          organizations: organizations.length,
          organizationMemberships: organizationMemberships.length,
          workspaces: workspaces.length,
          workspaceAccesses: workspaceAccesses.length,
          knowledgeAssets: knowledgeAssets.length,
          publicLeads: publicLeads.length,
          marketingEvents: marketingEvents.length,
        },
        null,
        2,
      ),
    );
  } finally {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
