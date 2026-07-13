import {
  Workspace,
  LocalFilesystem,
  LocalSandbox,
} from "@mastra/core/workspace";
import { WORKSPACE_PATH } from "./paths";

// Default workspace: sandboxed filesystem + shell at ./workspace (or
// ASSISTANT_WORKSPACE_DIR). Skills are auto-discovered from workspace/skills/.
// Drop a new skill as workspace/skills/<name>/SKILL.md and it's picked up
// on restart, no code changes needed.
export const workspace = new Workspace({
  id: "default",
  name: "Default Workspace",
  filesystem: new LocalFilesystem({
    basePath: WORKSPACE_PATH,
  }),
  sandbox: new LocalSandbox({
    workingDirectory: WORKSPACE_PATH,
  }),
  bm25: true,
  skills: ["skills"],
  tools: {
    enabled: true,
    requireApproval: false,
  },
});
