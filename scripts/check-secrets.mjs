import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const patterns = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["GitHub token", /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/],
  ["OpenAI key", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/],
  ["AWS access key", /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{30,}\b/],
  ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
  ["assigned credential", /\b(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\b\s*[:=]\s*["'](?!\$|<|\{|example|placeholder|your[_-])[A-Za-z0-9_./+=-]{16,}["']/i]
];

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);
const findings = [];

for (const path of tracked) {
  if (/\.(?:png|jpe?g|gif|webp|ico|woff2?|pdf|zip)$/i.test(path)) continue;
  let content;
  try {
    content = readFileSync(path, "utf8");
  } catch {
    continue;
  }
  if (content.includes("\0")) continue;
  for (const [index, line] of content.split(/\r?\n/).entries()) {
    for (const [kind, pattern] of patterns) {
      if (pattern.test(line)) findings.push(`${path}:${index + 1}: possible ${kind}`);
    }
  }
}

if (findings.length) {
  console.error(findings.join("\n"));
  console.error("Credential values are intentionally hidden. Remove them and rotate any exposed keys.");
  process.exitCode = 1;
} else {
  console.log(`No common credential patterns found in ${tracked.length} tracked files.`);
}
