import { Memory } from "@mastra/memory";

// Memory with last-messages recall + working memory scratchpad.
// Semantic recall is disabled because it requires an embedder (local ONNX
// model or an embeddings API), which adds complexity for cloud deploys.
// lastMessages alone is sufficient context for most conversations.
export const memory = new Memory({
  options: {
    lastMessages: 20,
    semanticRecall: false,
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
