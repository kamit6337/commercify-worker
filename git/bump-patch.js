// ./git/bump-patch.js
import { execSync } from "child_process";

try {
  const latest =
    execSync("git tag", { encoding: "utf-8" })
      .split("\n")
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .pop() || "v0.0.0";

  const [major, minor, patch] = latest.replace(/^v/, "").split(".").map(Number);
  const newTag = `v${major}.${minor}.${patch + 1}`;

  execSync(`git tag -a ${newTag} -m "Release ${newTag}"`);
  execSync(`git push origin ${newTag}`);

  console.log(`📦 Created and pushed tag: ${newTag}`);
} catch (err) {
  console.error("❌ Failed to bump tag:", err.message);
  process.exit(1);
}
