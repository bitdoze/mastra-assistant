import { Memory } from "@mastra/memory";
import { LibSQLVector } from "@mastra/libsql";
import { fastembed } from "@mastra/fastembed";

// LibSQL/Turso vector store for semantic recall. Uses the same database URL
// as the main storage. TURSO_DATABASE_URL must be set (required for deploy).
const tursoUrl = process.env.TURSO_DATABASE_URL;
if (!tursoUrl) {
  throw new Error("TURSO_DATABASE_URL is not set. Add it to your .env file.");
}
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || undefined;

const vectorStore = new LibSQLVector({
  id: "agent-vector",
  url: tursoUrl,
  ...(tursoAuthToken ? { authToken: tursoAuthToken } : {}),
});

// Memory with last-messages recall, semantic recall (vector search over past
// messages), and working memory scratchpad.
//
// - Vector store: LibSQLVector on the same Turso/libSQL database.
// - Embedder: @mastra/fastembed runs locally (bge-small-en-v1.5) via ONNX
//   Runtime, so no embedding API key needed. First use downloads the model.
// - Working memory: persists across all threads for a resource (user).
export const memory = new Memory({
  vector: vectorStore,
  embedder: fastembed,
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
