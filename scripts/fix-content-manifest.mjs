import { copyFile, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const target = process.argv[2];
if (!new Set(["chrome-mv3-prod", "firefox-mv3-prod"]).has(target)) {
  throw new Error("Expected a production extension target.");
}

const path = join("build", target, "manifest.json");
const manifest = JSON.parse(await readFile(path, "utf8"));
const content = manifest.content_scripts?.find((script) =>
  script.js?.some((file) => /^content\.[\da-f]+\.js$/.test(file))
);
if (!content) {
  throw new Error(`Main content script missing from ${path}`);
}

content.all_frames = true;
content.match_about_blank = true;
if (target === "chrome-mv3-prod") {
  content.match_origin_as_fallback = true;
}
await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
await copyFile("LICENSE", join("build", target, "LICENSE"));
await copyFile("NOTICE.txt", join("build", target, "NOTICE.txt"));
await copyFile(join("assets", "fonts", "Manrope-OFL.txt"), join("build", target, "Manrope-OFL.txt"));
