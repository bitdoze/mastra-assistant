import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { join } from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import { WORKSPACE_PATH } from "../paths";

const digestStep = createStep({
    id: "generate-digest",
    inputSchema: z.object({}).optional(),
    retries: 2,
    outputSchema: z.object({
        ok: z.boolean(),
        path: z.string().optional(),
        error: z.string().optional(),
    }),
    execute: async ({ inputData, mastra }) => {
        const today = new Date().toISOString().split("T")[0];
        const agent = mastra.getAgent("assistant");

        try {
            const result = await agent.generate(
                `You are a daily tech news curator. Today is ${today}. Research and compile a comprehensive daily digest using web search (tinyfish_search + tinyfish_fetch) and the github_trending_repos tool. Cover these sections:

## 1. AI News (top 5)
Search for the latest AI developments from the last 24-48 hours. Focus on: new model releases, benchmark results, open-source AI tools, AI agents, local AI, regulation, and research breakthroughs. For each: title, source link, and 2-3 sentences of real substance.

## 2. Developer & DevOps News (top 5)
Search for news in: Docker, Kubernetes, CI/CD, cloud (AWS/GCP/Azure), infrastructure-as-code, observability, terminal/CLI tools, and developer experience. For each: title, source link, and why it matters to a developer.

## 3. Self-Hosting & Homelab (top 3-4)
Search for new self-hosted apps, Docker containers, home server builds, and networking tools trending today. For each: name, GitHub or project link, and what it does.

## 4. Trending GitHub Repositories (top 10)
Use the github_trending_repos tool to find trending repos from the last 7 days. Pick the 10 most interesting across AI, developer tools, CLI utilities, self-hosting, and open source. For each: repo name with link, one-line description, language, and star count.

## 5. Hacker News Top Stories (top 5)
Search for today's top Hacker News stories. For each: title, link, and a brief description.

Format everything as clean markdown with clear section headers, bullet points, and links. Be specific and factual, no filler or hype. If you couldn't find something for a section, say so rather than guessing.`,
                {
                    memory: {
                        thread: `digest-${today}`,
                        resource: "workflow:digest",
                    },
                },
            );

            const digestDir = join(WORKSPACE_PATH, "digests");
            await mkdir(digestDir, { recursive: true });
            const filePath = join(digestDir, `news-${today}.md`);
            await writeFile(filePath, result.text, "utf-8");

            return { ok: true, path: filePath };
        } catch (error) {
            return {
                ok: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    },
});

export const newsDigest = createWorkflow({
    id: "news-digest",
    inputSchema: z.object({}).optional(),
    outputSchema: z.object({
        ok: z.boolean(),
        path: z.string().optional(),
        error: z.string().optional(),
    }),
    schedule: {
        cron: "30 7 * * *",
        timezone: process.env.AGENT_TIMEZONE ?? "UTC",
        inputData: {},
    },
})
    .then(digestStep)
    .commit();
