import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = resolve(root, "public");
const distDir = resolve(root, "dist");

if (!existsSync(resolve(publicDir, "index.html"))) {
  console.error("Missing public/index.html — run build-idecompiler-lovable-v7.sh first or copy the site into public/");
  process.exit(1);
}

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });
cpSync(publicDir, distDir, { recursive: true });

console.log("Static site copied to dist/ (" + distDir + ")");
