import { Mastra } from "@mastra/core/mastra";
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

// Turso / libSQL database URL. Defaults to local file for dev.
// For production: set TURSO_DATABASE_URL to your Turso URL and
// TURSO_AUTH_TOKEN to your Turso token.
const tursoUrl = process.env.TURSO_DATABASE_URL ?? "file:./mastra.db";
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || undefined;

export const mastra = new Mastra({
  agents: { assistant },
  workflows: { newsDigest },
  workspace,
  editor: new MastraEditor(),
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
          new MastraPlatformExporter(),
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(),
        ],
      },
    },
  }),
});
