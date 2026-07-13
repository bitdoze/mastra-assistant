import { Mastra } from "@mastra/core/mastra";
import { defineAuth } from "@mastra/core/server";
import { MastraEditor } from "@mastra/editor";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { DuckDBStore } from "@mastra/duckdb";
import { MastraCompositeStore } from "@mastra/core/storage";
import {
  Observability,
  MastraStorageExporter,
  MastraPlatformExporter,
  SensitiveDataFilter,
} from "@mastra/observability";
import { assistant } from "./agents/assistant";
import { workspace } from "./workspaces";
import { newsDigest } from "./workflows/news-digest";

// Turso / libSQL database URL (required). Set in .env before starting.
const tursoUrl = process.env.TURSO_DATABASE_URL;
if (!tursoUrl) {
  throw new Error("TURSO_DATABASE_URL is not set. Add it to your .env file.");
}
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || undefined;

// API key auth. Set MASTRA_API_KEY in .env. Clients pass it as
// `Authorization: Bearer <key>` or `x-api-key: <key>`.
const auth = defineAuth({
  authenticateToken: async (token: string) => {
    const apiKey = process.env.MASTRA_API_KEY;
    if (!apiKey) return null;
    if (token === apiKey) return { id: "default" };
    return null;
  },
});

export const mastra = new Mastra({
  agents: { assistant },
  workflows: { newsDigest },
  workspace,
  editor: new MastraEditor(),
  server: { auth },
  storage: new MastraCompositeStore({
    id: "composite-storage",
    default: new LibSQLStore({
      id: "mastra-storage",
      url: tursoUrl,
      ...(tursoAuthToken ? { authToken: tursoAuthToken } : {}),
    }),
    domains: {
      observability: await new DuckDBStore().getStore("observability"),
    },
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: "mastra-assistant",
        exporters: [
          new MastraStorageExporter(),
          new MastraPlatformExporter({
            ...(process.env.MASTRA_PLATFORM_ACCESS_TOKEN
              ? { accessToken: process.env.MASTRA_PLATFORM_ACCESS_TOKEN }
              : {}),
            ...(process.env.MASTRA_PROJECT_ID
              ? { projectId: process.env.MASTRA_PROJECT_ID }
              : {}),
          }),
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(),
        ],
      },
    },
  }),
});
