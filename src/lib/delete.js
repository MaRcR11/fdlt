const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { getProcessesUsingPath } = require("./lockDetection");

const isWindows = process.platform === "win32";

function killProcesses(processes) {
  if (!processes.length) return;

  const uniqueProcesses = [...new Map(processes.map(p => [p.pid, p])).values()];

  let restartExplorer = false;

  for (const { pid, name } of uniqueProcesses) {
    try {
      if (isWindows) {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        if (name.toLowerCase() === "explorer.exe") {
          restartExplorer = true;
        }
      } else {
        execSync(`kill -9 ${pid}`, { stdio: "ignore" });
      }
    } catch (error) {
      console.log(`Failed to kill process ${pid} (${name}): ${error.message}`);
    }
  }

  const start = Date.now();
  while (Date.now() - start < 500) {}

  if (isWindows && restartExplorer) {
    try {
      execSync("start explorer.exe", { stdio: "ignore" });
    } catch (err) {
      console.log(`Failed to restart explorer.exe: ${err.message}`);
    }
  }
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

  const processes = getProcessesUsingPath(absPath);
  killProcesses(processes);

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
