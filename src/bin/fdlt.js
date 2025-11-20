#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const { forceDeletePath } = require("../lib/delete");

const args = process.argv.slice(2);

if (!args.length || args.includes("-h") || args.includes("--help")) {
  console.log(`
Usage: fdlt [options] <path>

Options:
  -r, -R, --recursive    Remove directories and their contents recursively
  -h, --help             Show help
  -v, --version          Show version
`);
  process.exit(0);
}

if (args.includes("-v") || args.includes("--version")) {
  try {
    const pkgPath = path.join(__dirname, "..", "..", "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    console.log(`fdel v${pkg.version}`);
  } catch (err) {
  }
  process.exit(0);
}

const recursive = args.includes("-r") || args.includes("--recursive");
const targetPath = args[args.length - 1];

forceDeletePath(targetPath, recursive);
