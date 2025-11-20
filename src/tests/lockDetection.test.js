const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { getProcessesUsingPath } = require("../lib/lockDetection");

jest.mock("child_process");

describe("getProcessesUsingPath", () => {
  const testFile = path.join(__dirname, "lockDetection.txt");

  beforeEach(() => {
    if (!fs.existsSync(testFile)) {
      fs.writeFileSync(testFile, "Hello world");
    }
  });

  afterEach(() => {
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
    jest.resetAllMocks();
  });

  test("should return empty array if file is not in use", () => {
    execSync.mockImplementation(() => "");
    const pids = getProcessesUsingPath(testFile);
    expect(pids).toEqual([]);
  });

  test("should return empty array if file does not exist", () => {
    execSync.mockImplementation(() => {
      throw new Error("File not found");
    });
    const pids = getProcessesUsingPath("nonexistent-file.txt");
    expect(pids).toEqual([]);
  });

  test("should parse pids from windows handle output", () => {
    Object.defineProperty(process, "platform", { value: "win32" });
    const mockOutput = `
    Notepad.exe pid: 1234
    SomeApp.exe pid: 5678
    `;
    execSync.mockReturnValue(mockOutput);

    const pids = getProcessesUsingPath(testFile);

    console.log(pids)
    expect(pids).toEqual([1234, 5678]);
  });

  test("should parse pids from unix lsof output", () => {
    Object.defineProperty(process, "platform", { value: "linux" });
    const mockOutput = `
COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
vim      1111 user   4u   REG  253,0     123 456 /tmp/test-file.txt
nano     2222 user   5r   REG  253,0     456 789 /tmp/test-file.txt
    `;
    execSync.mockReturnValue(mockOutput);

    const pids = getProcessesUsingPath(testFile);
    expect(pids).toEqual([1111, 2222]);
  });
});
