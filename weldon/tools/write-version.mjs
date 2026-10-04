// Écrit server/version.json au moment du build Netlify (COMMIT_REF n'existe qu'au build).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const commit = process.env.COMMIT_REF || process.env.RENDER_GIT_COMMIT || "local";
fs.writeFileSync(path.join(root, "server", "version.json"), JSON.stringify({ commit, built_at: new Date().toISOString() }) + "\n");
console.log("version", commit.slice(0, 7));
