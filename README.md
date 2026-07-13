# Mastra Assistant

A lean [Mastra](https://mastra.ai) assistant with live-web research tools, workspace file/shell access, and persistent memory. Runs entirely on your own infrastructure with local databases.

## What's included

**One agent** (`assistant`) with:

- **TinyFish tools** - live web search (`tinyfish_search`) and page content extraction (`tinyfish_fetch`)
- **YouTube tools** - video metadata (`fetch-youtube-metadata`) and transcript/caption fetching (`fetch-youtube-transcript`)
- **GitHub tools** - trending repo discovery (`github_trending_repos`) and repo detail + README fetch (`github_repo`)
- **Research skill** - a reusable workflow (search then fetch) checked into `workspace/skills/research/`
- **Workspace** - sandboxed file read/write/edit, grep, and shell command execution
- **Memory** - last-messages recall, semantic recall via vector search (free local embeddings), and a resource-scoped working memory scratchpad

**No Discord, no social posting, no video pipelines.** Just research and coding assistance.

**Plus a scheduled workflow** (`news-digest`) that runs daily at 7:30 AM, researches AI news, DevOps updates, self-hosting, trending GitHub repos, and Hacker News, then writes a markdown digest to `workspace/digests/`.

## Stack

| Component | Technology |
|-----------|-----------|
| AI models | [OpenRouter](https://openrouter.ai) (hundreds of models, free tiers available) |
| Storage | [LibSQL / Turso](https://turso.tech) (composite store: LibSQL for data + DuckDB for observability) |
| Memory vectors | LibSQLVector (same database) |
| Observability | Mastra Observability with DuckDB backend (local) |
| Studio Editor | MastraEditor enabled (edit agents visually in Studio) |

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
| `TURSO_DATABASE_URL` | No | LibSQL/Turso URL. Use `file:./mastra.db` for local. Set to a Turso URL for remote access |
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
│   ├── index.ts              # Mastra instance: storage, observability, editor, agents, workflows
│   ├── agents/
│   │   └── assistant.ts      # The assistant agent
│   ├── tools/
│   │   ├── tinyfish-*.ts     # Web search + fetch
│   │   ├── youtube-*.ts      # YouTube metadata + transcript
│   │   └── github-*.ts       # GitHub trending + repo details
│   ├── workflows/
│   │   └── news-digest.ts    # Daily news digest (scheduled, writes to workspace)
│   ├── memory.ts             # Memory config (semantic recall + working memory)
│   ├── workspaces.ts         # Sandboxed workspace config
│   ├── paths.ts              # Path resolution
│   └── shared.ts             # Model defaults + date helpers
├── workspace/
│   ├── skills/
│   │   └── research/
│   │       └── SKILL.md      # Research workflow skill
│   └── digests/              # Generated news digests land here
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

## News digest workflow

The `news-digest` workflow runs automatically on a cron schedule (`30 7 * * *`, configurable via `AGENT_TIMEZONE`). It uses the assistant agent to:

1. Search the web for AI news, DevOps updates, self-hosting, and Hacker News top stories
2. Fetch trending GitHub repos from the last 7 days
3. Write a formatted markdown digest to `workspace/digests/news-YYYY-MM-DD.md`

You can also trigger it manually from Studio's Workflows tab.

## Deploy (self-hosted)

This project runs entirely on your own machine. No cloud required. The `build` script bundles Studio into the output, so `npm run start` gives you both the API and Studio UI.

### Build and start

```bash
npm run build
npm run start
```

Studio is available at `http://localhost:4111`.

### Run on macOS (Mac Mini, MacBook, etc.)

**Install Node.js 22+** (if not already):

```bash
brew install node@22
```

**Clone, configure, build, and run:**

```bash
git clone https://github.com/bitdoze/mastra-assistant.git
cd mastra-assistant
npm install
cp .env.example .env
# Edit .env with your keys
npm run build
npm run start
```

**Keep it running 24/7 with pm2:**

```bash
npm install -g pm2
pm2 start .mastra/output/index.mjs --name mastra-assistant --env .env
pm2 save
pm2 startup
```

**Optional - expose securely with Tailscale:**

```bash
brew install tailscale
sudo tailscale up
```

Access Studio from any device on your tailnet at `http://your-mac-mini:4111`. No port forwarding needed.

### Run on Linux (Ubuntu, Debian, etc.)

**Install Node.js 22+:**

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Clone, configure, build, and run:**

```bash
git clone https://github.com/bitdoze/mastra-assistant.git
cd mastra-assistant
npm install
cp .env.example .env
# Edit .env with your keys
npm run build
npm run start
```

**Keep it running 24/7 with pm2:**

```bash
sudo npm install -g pm2
pm2 start .mastra/output/index.mjs --name mastra-assistant
pm2 save
pm2 startup
```

**Optional - reverse proxy with Caddy (HTTPS):**

```bash
sudo apt install caddy
```

Create `/etc/caddy/Caddyfile`:

```
your-domain.com {
    reverse_proxy localhost:4111
}
```

```bash
sudo systemctl restart caddy
```

Studio is now available at `https://your-domain.com` with automatic HTTPS.

### Database options

**Local SQLite (simplest, zero cost):**

```bash
TURSO_DATABASE_URL=file:./mastra.db
```

Works on both macOS and Linux. Back up the `mastra.db` file regularly.

**Turso (remote, for multi-device access):**

```bash
turso db create mastra-assistant
turso db tokens create mastra-assistant
```

```bash
TURSO_DATABASE_URL=libsql://mastra-assistant-<your-org>.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOi...
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Mastra Studio dev server on port 4111 |
| `npm run build` | Build for production (bundles Studio into output) |
| `npm run start` | Start the production server with Studio |
| `npm run typecheck` | Run TypeScript type checking |
