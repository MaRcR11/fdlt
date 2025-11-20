const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { getProcessesUsingPath } = require("./lockDetection");

const isWindows = process.platform === "win32";

function killProcesses(pids) {
  if (!pids.length) return;

  for (const pid of pids) {
    try {
      if (isWindows) execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
      else execSync(`kill -9 ${pid}`, { stdio: "ignore" });
    } catch (error) {
      console.log(`Failed to kill process ${pid}: ${error.message}`);
    }
  }

  const start = Date.now();
  while (Date.now() - start < 500) {}
}

function forceDeletePath(targetPath, recursive = false) {
  const absPath = path.resolve(targetPath);

  if (!fs.existsSync(absPath)) {
    console.log(`Path does not exist: ${absPath}`);
    return false;
  }

  const stats = fs.statSync(absPath);

  if (stats.isDirectory() && !recursive) {
    console.log(`Cannot remove '${absPath}': Is a directory`);
    return false;
  }


  const pids = getProcessesUsingPath(absPath);
  killProcesses(pids);

  try {
    if (stats.isDirectory()) {
      if (isWindows) {
        execSync(`rmdir /s /q "${absPath}"`, { stdio: "inherit" });
      } else {
        fs.rmSync(absPath, { recursive: true, force: true, maxRetries: 3 });
      }
    } else {
      if (isWindows) {
        execSync(`del /f /q "${absPath}"`, { stdio: "inherit" });
      } else {
        fs.unlinkSync(absPath);
      }
    }

    return true;
  } catch (error) {
    console.log(`Failed to delete: ${absPath} (${error.message})`);
    return false;
  }
}

module.exports = { forceDeletePath, killProcesses };
