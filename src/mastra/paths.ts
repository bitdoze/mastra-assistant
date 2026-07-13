import path from "node:path";

// Resolve the project root from cwd. Mastra's dev server runs from
// src/mastra/public/ and production runs from .mastra/output/, so we
// strip those suffixes to anchor paths to the real project root.
export function getProjectRoot(): string {
  const cwd = process.cwd();
  const devRuntimePath = `${path.sep}src${path.sep}mastra${path.sep}public`;
  const buildRuntimePath = `${path.sep}.mastra${path.sep}output`;

  if (cwd.includes(devRuntimePath)) {
    return cwd.slice(0, cwd.indexOf(devRuntimePath));
  }
  if (cwd.includes(buildRuntimePath)) {
    return cwd.slice(0, cwd.indexOf(buildRuntimePath));
  }
  return cwd;
}

export const PROJECT_ROOT = getProjectRoot();

// Workspace filesystem root. Override via CLAW_WORKSPACE_DIR.
export const WORKSPACE_PATH = path.resolve(
  PROJECT_ROOT,
  process.env.ASSISTANT_WORKSPACE_DIR || "./workspace",
);
