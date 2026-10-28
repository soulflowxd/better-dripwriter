import { cp, readFile, rm, stat } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(workspace, "build", "chrome-mv3-prod");
const destination = resolve(workspace, "extension");

// Keep the recursive replacement pinned to this repository's extension folder.
if (relative(workspace, destination) !== "extension") {
  throw new Error("Refusing to replace a folder outside the extension workspace.");
}

const sourceManifest = JSON.parse(await readFile(resolve(source, "manifest.json"), "utf8"));
if (sourceManifest.name !== "Better Dripwriter" || sourceManifest.manifest_version !== 3) {
  throw new Error("The Chrome build manifest is missing or unexpected.");
}
await stat(source);
await rm(destination, { recursive: true, force: true });
await cp(source, destination, { recursive: true });
console.log(`Updated ${relative(workspace, destination)}/ for Load unpacked.`);
