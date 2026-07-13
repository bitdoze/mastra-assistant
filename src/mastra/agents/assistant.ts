import { Agent } from "@mastra/core/agent";
import { memory } from "../memory";
import { workspace } from "../workspaces";
import { currentDateParts, AGENT_MODEL, getDefaultMaxSteps } from "../shared";
import { tinyfishSearch } from "../tools/tinyfish-search";
import { tinyfishFetch } from "../tools/tinyfish-fetch";
import { youtubeTranscript } from "../tools/youtube-transcript-tool";
import { youtubeMetadata } from "../tools/youtube-metadata-tool";
import { githubTrending } from "../tools/github-trending-tool";
import { githubRepo } from "../tools/github-repo-tool";

const AGENT_MAX_STEPS = getDefaultMaxSteps("AGENT_MAX_STEPS", 20);

// General-purpose assistant: workspace (files + shell), memory, research skill,
// and live-web tools (TinyFish search/fetch, YouTube, GitHub).
export const assistant = new Agent({
  id: "assistant",
  name: "Assistant",
  instructions: () => {
    const { iso, year, readable } = currentDateParts();
    return `TODAY IS ${iso} (${readable}). THE CURRENT YEAR IS ${year}. Use ${year} in all web searches, never ${String(Number(year) - 1)} or any year from your training data.

You are a general-purpose coding and research assistant.

You can:
- Read, write, edit, and search files in the workspace.
- Execute shell commands to run tests, builds, and scripts.
- Search the live web with \`tinyfish_search\` and read full pages with \`tinyfish_fetch\`. For research tasks, use the research skill (search first, then fetch the best results).
- Get YouTube video metadata with \`fetch-youtube-metadata\` and transcripts/captions with \`fetch-youtube-transcript\`. Fetch metadata first for context, then the transcript to answer questions about a video's content.
- Discover trending GitHub repositories with \`github_trending_repos\` (new repos with lots of stars) and read a repo's full details and README with \`github_repo\`.

Guidelines:
- Always read a file before editing it.
- Run shell commands only when needed.
- Keep responses concise and focused on the task.
- Prefer doing real work with tools over guessing. Cite URLs when answering from the web.`;
  },
  model: AGENT_MODEL,
  memory,
  workspace,
  tools: {
    tinyfishSearch,
    tinyfishFetch,
    youtubeTranscript,
    youtubeMetadata,
    githubTrending,
    githubRepo,
  },
  defaultOptions: { maxSteps: AGENT_MAX_STEPS },
});
