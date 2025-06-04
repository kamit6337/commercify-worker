// ./git/bump-minor.js
import { execSync } from "child_process";

try {
  const latest =
    execSync("git tag", { encoding: "utf-8" })
      .split("\n")
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .pop() || "v0.0.0";

  const [major, minor] = latest.replace(/^v/, "").split(".").map(Number);
  const newTag = `v${major}.${minor + 1}.0`;

  execSync(`git tag -a ${newTag} -m "Release ${newTag}"`);
  execSync(`git push origin ${newTag}`);
  console.log(`📦 Created and pushed MINOR tag: ${newTag}`);
} catch (err) {
  console.error("❌ Failed to bump MINOR version:", err.message);
  process.exit(1);
}
