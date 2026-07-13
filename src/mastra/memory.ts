import { Memory } from "@mastra/memory";
import { LibSQLVector } from "@mastra/libsql";

// LibSQL/Turso vector store for semantic recall. Uses the same database URL
// as the main storage. Works with both local file: and remote Turso URLs.
const tursoUrl = process.env.TURSO_DATABASE_URL ?? "file:./mastra.db";
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || undefined;

const vectorStore = new LibSQLVector({
  id: "agent-vector",
  url: tursoUrl,
  ...(tursoAuthToken ? { authToken: tursoAuthToken } : {}),
});

// Working memory (resource-scoped Markdown scratchpad) + semantic recall
// (vector search over past messages).
//
// - Storage: composite store (LibSQL + DuckDB observability) wired in
//   index.ts; Memory inherits it.
// - Vector store: LibSQLVector on the same Turso/libSQL database.
// - Working memory: persists across all threads for a resource (user).
export const memory = new Memory({
  vector: vectorStore,
  options: {
    lastMessages: 20,
    semanticRecall: {
      topK: 3,
      messageRange: 2,
    },
    workingMemory: {
      enabled: true,
      scope: "resource",
      template: `# User Profile

## Identity
- Name:
- Timezone:
- Preferred Language:

## Preferences
- Communication Style:
- Coding Conventions:

## Session State
- Active Task:
- Open Questions:
- Decisions Made:
`,
    },
  },
});
