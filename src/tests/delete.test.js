const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { forceDeletePath } = require("../lib/delete");

describe("forceDeletePath tests", () => {
  const testDir = path.join(__dirname, "temp-test");
  const testFile = path.join(testDir, "file.txt");
  const nestedDir = path.join(testDir, "nested");
  const nestedFile = path.join(nestedDir, "nested-file.txt");

  beforeEach(() => {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
    fs.writeFileSync(testFile, "Hello, world!");
  });

  afterEach(() => {
    try {
      if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
      if (fs.existsSync(nestedFile)) fs.unlinkSync(nestedFile);
      if (fs.existsSync(nestedDir))
        fs.rmdirSync(nestedDir, { recursive: true });
      if (fs.existsSync(testDir)) fs.rmdirSync(testDir, { recursive: true });
    } catch (err) {
      console.warn("Cleanup failed:", err.message);
    }
  });

  (process.platform === "win32" ? test : test.skip)(
    "should delete a Word file even if it is open",
    (done) => {
      exec(`start winword "${testFile}"`, (err) => {
        if (err) return done(err);
        setTimeout(() => {
          try {
            const result = forceDeletePath(testFile);
            expect(result).toBe(true);
            expect(fs.existsSync(testFile)).toBe(false);
            done();
          } catch (error) {
            done(error);
          }
        }, 3000);
      });
    }
  );

  test("should delete a file that is not locked", () => {
    const result = forceDeletePath(testFile);
    expect(result).toBe(true);
    expect(fs.existsSync(testFile)).toBe(false);
  });


  test("should delete a file inside a directory while keeping the directory", () => {
    if (!fs.existsSync(nestedDir)) fs.mkdirSync(nestedDir);
    fs.writeFileSync(nestedFile, "Nested content");
    const result = forceDeletePath(nestedFile);
    expect(result).toBe(true);
    expect(fs.existsSync(nestedFile)).toBe(false);
    expect(fs.existsSync(nestedDir)).toBe(true);
  });



  test("should delete directories and their contents recursively", () => {
    if (!fs.existsSync(nestedDir)) fs.mkdirSync(nestedDir);
    fs.writeFileSync(nestedFile, "Nested content");

    const deepNestedDir = path.join(nestedDir, "deep");
    const deepNestedFile = path.join(deepNestedDir, "deep-file.txt");
    fs.mkdirSync(deepNestedDir);
    fs.writeFileSync(deepNestedFile, "Deep nested content");

    const result = forceDeletePath(testDir, true);
    expect(result).toBe(true);

    expect(fs.existsSync(deepNestedFile)).toBe(false);
    expect(fs.existsSync(deepNestedDir)).toBe(false);
    expect(fs.existsSync(nestedFile)).toBe(false);
    expect(fs.existsSync(nestedDir)).toBe(false);
    expect(fs.existsSync(testDir)).toBe(false);
  });

});
