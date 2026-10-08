import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const BACKUP_FILE = ".workshop-backup.json";
const CHECKPOINTS = {
  red: "checkpoint/red",
  "slice-1": "checkpoint/slice-1",
  "slice-2": "checkpoint/slice-2",
  green: "checkpoint/green",
};

function git(args, options = {}) {
  const result = spawnSync("git", args, { encoding: "utf8", ...options });
  if (result.status !== 0) {
    const stderr = typeof result.stderr === "string" ? result.stderr.trim() : "";
    const stdout = typeof result.stdout === "string" ? result.stdout.trim() : "";
    const detail = stderr || stdout || "Git command failed";
    throw new Error(detail);
  }
  return typeof result.stdout === "string" ? result.stdout.trim() : "";
}

function usage() {
  console.log("Usage:");
  console.log("  npm run checkpoint -- list");
  console.log("  npm run checkpoint -- go <red|slice-1|slice-2|green>");
  console.log("  npm run checkpoint -- recover");
}

function refExists(ref) {
  return spawnSync("git", ["show-ref", "--verify", "--quiet", ref]).status === 0;
}

function list() {
  for (const [name, branch] of Object.entries(CHECKPOINTS)) {
    const local = refExists(`refs/heads/${branch}`);
    const remote = refExists(`refs/remotes/origin/${branch}`);
    const location = local ? "local" : remote ? "origin" : "missing";
    console.log(`${local || remote ? "✓" : "·"} ${name.padEnd(8)} ${branch} (${location})`);
  }
}

function ensureCheckpointExists(branch) {
  if (refExists(`refs/heads/${branch}`)) return "local";
  if (!refExists(`refs/remotes/origin/${branch}`)) {
    git(["fetch", "origin", `+refs/heads/${branch}:refs/remotes/origin/${branch}`], { stdio: "inherit" });
  }
  if (!refExists(`refs/remotes/origin/${branch}`)) throw new Error(`Checkpoint branch not found: ${branch}`);
  return "remote";
}

function saveDirtyWork() {
  if (!git(["status", "--porcelain"])) return null;
  const label = `workshop backup ${new Date().toISOString()}`;
  git(["stash", "push", "--include-untracked", "--message", label]);
  const commit = git(["rev-parse", "refs/stash"]);
  writeFileSync(BACKUP_FILE, `${JSON.stringify({ commit, label }, null, 2)}\n`, "utf8");
  return commit;
}

function go(name) {
  const branch = CHECKPOINTS[name];
  if (!branch) throw new Error(`Unknown checkpoint: ${name}`);
  const location = ensureCheckpointExists(branch);
  const backup = saveDirtyWork();
  if (location === "local") git(["switch", branch], { stdio: "inherit" });
  else git(["switch", "--track", "--create", branch, `origin/${branch}`], { stdio: "inherit" });
  console.log(`Checkpoint opened: ${name}`);
  if (backup) console.log("Your previous changes were saved. Restore them with: npm run checkpoint -- recover");
}

function recover() {
  if (!existsSync(BACKUP_FILE)) throw new Error("No workshop backup was recorded");
  const parsed = JSON.parse(readFileSync(BACKUP_FILE, "utf8"));
  if (typeof parsed.commit !== "string") throw new Error("Workshop backup record is invalid");
  git(["stash", "apply", parsed.commit], { stdio: "inherit" });
  console.log("Previous changes restored. The backup remains in git stash as an extra safety copy.");
}

try {
  const [command, argument] = process.argv.slice(2);
  if (command === "list") list();
  else if (command === "go" && argument) go(argument);
  else if (command === "recover") recover();
  else usage();
} catch (error) {
  console.error(`Checkpoint error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
