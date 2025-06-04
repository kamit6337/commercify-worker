import { execSync } from "child_process";

try {
  execSync("npm version patch", { stdio: "inherit" }); // bumps version, commits, and tags
  execSync("git push origin main --follow-tags", { stdio: "inherit" });

  console.log("📦 Bumped patch version and pushed with tag");
} catch (err) {
  console.error("❌ Failed to bump version:", err.message);
  process.exit(1);
}
