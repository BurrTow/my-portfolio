// Points git at the tracked .githooks directory so the commit-msg hook is
// active in every clone. Runs from the postinstall script.
//
// core.hooksPath is used rather than copying files into .git/hooks: the hook
// stays version-controlled, updates reach everyone on their next pull, and no
// machine-specific state is created that could be committed by accident.
//
// Never fails the install. A tarball install, a CI export, or a sandbox
// without git should all continue silently.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

// .git is a directory in a normal clone and a file in a worktree or submodule.
if (!existsSync(".git")) process.exit(0);

try {
  execSync("git config core.hooksPath .githooks", { stdio: "ignore" });
} catch {
  // git missing or config unwritable — not worth interrupting an install over.
}
