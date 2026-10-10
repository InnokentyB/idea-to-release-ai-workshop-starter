import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { chromium } from "@playwright/test";

const problems = [];
const nodeMajor = Number(process.versions.node.split(".")[0]);

if (nodeMajor < 22) problems.push(`Node.js 22 or newer is required; found ${process.versions.node}`);
if (!existsSync("node_modules")) problems.push("Dependencies are missing; run npm ci");
if (!existsSync(".git")) problems.push("This folder is not a Git repository");
if (!existsSync(chromium.executablePath())) problems.push("Playwright Chromium is missing; run npx playwright install chromium");

const appSource = readFileSync("src/App.tsx", "utf8");
if (!appSource.includes("WORKSHOP READY") && !appSource.includes("Подготовьте событие") && !appSource.includes("Заявки на мероприятия")) {
  problems.push("src/App.tsx does not contain a known workshop screen");
}

if (problems.length === 0) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const build = spawnSync(npmCommand, ["run", "build"], { encoding: "utf8" });
  if (build.status !== 0) {
    problems.push(`Build failed:\n${build.stdout}\n${build.stderr}`);
  }
}

if (!existsSync("dist/index.html")) problems.push("dist/index.html was not created");

if (problems.length > 0) {
  console.error("NOT READY FOR WORKSHOP");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("READY FOR WORKSHOP");
