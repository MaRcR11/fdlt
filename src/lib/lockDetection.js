const { execSync } = require("child_process");
const path = require("path");

function getProcessesUsingPath(targetPath) {
  const absPath = path.resolve(targetPath);

  if (process.platform === "win32") {
    try {
      const output = execSync(`handle.exe -accepteula "${absPath}"`, {
        encoding: "utf8",
      });

      const processes = [];
      const regex = /^(\S+).*pid:\s*(\d+)/gim;

      let match;
      while ((match = regex.exec(output)) !== null) {
        const name = match[1];
        const pid = parseInt(match[2]);
        processes.push({ pid, name });
      }


      return processes;
    } catch (err) {
      return [];
    }
  } else {
    try {
      const output = execSync(`lsof "${absPath}" 2>/dev/null`, {
        encoding: "utf8",
      });
      const lines = output.split("\n").slice(1);
      const processes = [];

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts[1] && !isNaN(parseInt(parts[1]))) {
          processes.push({ pid: parseInt(parts[1]), name: parts[0] });
        }
      }

      return processes;
    } catch {
      return [];
    }
  }
}

module.exports = { getProcessesUsingPath };
