// Bundles src/ into ONE self-contained HTML file: play/GrandLine.html
// The player just double-clicks that file. No server, no install.
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));

const result = await build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  write: false,
  format: "iife",
  target: "es2020",
  minify: false, // keep readable so errors point somewhere useful
  sourcemap: false,
  define: { __GAME_VERSION__: JSON.stringify(pkg.version) },
  logLevel: "error",
});

const js = result.outputFiles[0].text;
const css = readFileSync("src/styles.css", "utf8");
const template = readFileSync("src/index.html", "utf8");

const html = template
  .replace("/*__CSS__*/", () => css)
  .replace("/*__JS__*/", () => js.replace(/<\/script/gi, "<\\/script"))
  .replace(/__GAME_VERSION__/g, pkg.version);

mkdirSync("play", { recursive: true });
writeFileSync("play/GrandLine.html", html);
console.log(`Built play/GrandLine.html (v${pkg.version}, ${(html.length / 1024).toFixed(1)} KB)`);
