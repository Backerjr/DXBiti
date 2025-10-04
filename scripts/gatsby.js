#!/usr/bin/env node
const { spawnSync } = require("node:child_process");

const args = process.argv.slice(2);

if (args[0] === "build") {
  const result = spawnSync("npm", ["run", "build"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  process.exit(result.status ?? 0);
}

console.error(
  `Unsupported Gatsby command: ${args.join(" ") || "(none)"}. This project uses Next.js; try \"npm run build\" instead.`
);
process.exit(1);
