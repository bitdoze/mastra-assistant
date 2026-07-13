# Mastra Assistant

A lean [Mastra](https://mastra.ai) assistant with live-web research tools, workspace file/shell access, and persistent memory. Built for deployment on [Mastra Cloud](https://mastra.ai/docs/mastra-platform/overview).

## What's included

**One agent** (`assistant`) with:

- **TinyFish tools** - live web search (`tinyfish_search`) and page content extraction (`tinyfish_fetch`)
- **YouTube tools** - video metadata (`fetch-youtube-metadata`) and transcript/caption fetching (`fetch-youtube-transcript`)
- **GitHub tools** - trending repo discovery (`github_trending_repos`) and repo detail + README fetch (`github_repo`)
- **Research skill** - a reusable workflow (search then fetch) checked into `workspace/skills/research/`
- **Workspace** - sandboxed file read/write/edit, grep, and shell command execution
- **Memory** - last-messages recall, semantic recall via vector search, and a resource-scoped working memory scratchpad

**No Discord, no social posting, no video pipelines.** Just research and coding assistance.

## Stack

| Component | Technology |
|-----------|-----------|
| AI models | [OpenRouter](https://openrouter.ai) (hundreds of models, free tiers available) |
| Storage | [LibSQL / Turso](https://turso.tech) (composite store: LibSQL for data + DuckDB for observability) |
| Memory vectors | LibSQLVector (same database) |
| Observability | Mastra Observability with DuckDB backend + optional Mastra Platform export |

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in at minimum:

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENROUTER_API_KEY` | Yes | Access LLM models via OpenRouter. Get a key at [openrouter.ai/keys](https://openrouter.ai/keys) |
| `TINYFISH_API_KEY` | Yes | Web search and page fetch tools. Get a key at [tinyfish.com](https://tinyfish.com) |
| `GITHUB_TOKEN` | Recommended | GitHub API access (raises rate limits from 60 to 5000 req/hr). Create at [github.com/settings/tokens](https://github.com/settings/tokens) |
| `TURSO_DATABASE_URL` | No | LibSQL/Turso URL. Defaults to `file:./mastra.db` for local dev. Set to a Turso URL for production |
| `TURSO_AUTH_TOKEN` | No | Turso auth token (omit for local file DB) |

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:4111](http://localhost:4111) to access [Mastra Studio](https://mastra.ai/docs/studio/overview) and chat with the `assistant` agent.

## Choosing a model

The model is set via `AGENT_MODEL` in `.env`. It uses the `provider/model-name` format routed through OpenRouter.

**Free options** (no cost):

```bash
AGENT_MODEL=google/gemini-2.5-flash
# or
AGENT_MODEL=meta-llama/llama-3.3-70b-instruct:free
# or
AGENT_MODEL=qwen/qwen3-coder:free
# or
AGENT_MODEL=openai/gpt-oss-120b:free
```

Browse all 340+ models at [openrouter.ai/models](https://openrouter.ai/models).

## Project structure

```
mastra-assistant/
├── src/mastra/
│   ├── index.ts              # Mastra instance: storage, observability, agents
│   ├── agents/
│   │   └── assistant.ts      # The assistant agent
│   ├── tools/
│   │   ├── tinyfish-*.ts     # Web search + fetch
│   │   ├── youtube-*.ts      # YouTube metadata + transcript
│   │   └── github-*.ts       # GitHub trending + repo details
│   ├── memory.ts             # Memory config (semantic recall + working memory)
│   ├── workspaces.ts         # Sandboxed workspace config
│   ├── paths.ts              # Path resolution
│   └── shared.ts             # Model defaults + date helpers
├── workspace/
│   └── skills/
│       └── research/
│           └── SKILL.md      # Research workflow skill
├── .env.example
├── package.json
└── tsconfig.json
```

## Adding skills

Create a folder under `workspace/skills/<name>/` with a `SKILL.md`:

```markdown
---
name: my-skill
description: Short summary the agent uses to decide when to apply this skill.
version: 1.0.0
---

# Steps
1. Do this.
2. Then this.
```

The agent picks up new skills on the next request.

## Using Turso for production

1. Create a Turso database:

```bash
turso db create mastra-assistant
turso db tokens create mastra-assistant
```

2. Set the URL and token in `.env`:

```bash
TURSO_DATABASE_URL=libsql://mastra-assistant-<your-org>.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOi...
```

## Deploy to Mastra Cloud

1. Build the project:

```bash
npm run build
```

2. Deploy via the [Mastra Platform](https://projects.mastra.ai). See the [deployment docs](https://mastra.ai/docs/mastra-platform/overview) for details. Set all environment variables from `.env.example` in your cloud deployment settings.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Mastra Studio dev server on port 4111 |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run typecheck` | Run TypeScript type checking |
