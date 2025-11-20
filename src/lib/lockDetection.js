const { execSync } = require("child_process");
const path = require("path");

function getProcessesUsingPath(targetPath) {
  const absPath = path.resolve(targetPath);

  if (process.platform === "win32") {
    try {
      const output = execSync(`handle.exe -accepteula "${absPath}"`, {
        encoding: "utf8",
      });

      const pids = [];
      const regex = /pid: (\d+)/gi;
      let match;
      while ((match = regex.exec(output)) !== null) {
        pids.push(parseInt(match[1]));
      }
      return [...new Set(pids)];
    } catch (err) {
      return [];
    }
  } else {
    try {
      const output = execSync(`lsof "${absPath}" 2>/dev/null`, {
        encoding: "utf8",
      });
      const lines = output.split("\n").slice(1);
      const pids = [];
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts[1] && !isNaN(parseInt(parts[1])))
          pids.push(parseInt(parts[1]));
      }
      return [...new Set(pids)];
    } catch {
      return [];
    }
  }
}

module.exports = { getProcessesUsingPath };
