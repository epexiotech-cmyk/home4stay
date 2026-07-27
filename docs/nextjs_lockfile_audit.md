# Next.js Lockfile Permission Audit

## 1. Investigation Findings

* **Which lockfile Next.js is attempting to create:** Next.js (specifically Turbopack or SWC) is attempting to create and acquire a lock on the `.next/trace` or `.next/turbopack` cache files.
* **Exact filesystem path:** `D:\AAPP\home4stay\apps\main-site\.next\trace` (or `turbopack`). 
* **File ownership:** The files are owned by your Windows user account.
* **WSL mount permissions:** Inside WSL, the `D:\` drive is mounted as a 9P (DrvFs) filesystem with `uid=1000;gid=1000` (`D:\ on /mnt/d type 9p`).
* **Whether the project is running from `/mnt/d`:** Yes. Accessing the Windows partition `D:\` from within WSL maps directly to `/mnt/d/AAPP/home4stay`.
* **Whether this is a known Turbopack/WSL filesystem issue:** **Yes, this is a highly documented and known issue.** Next.js (via Turbopack and SWC, written in Rust) uses POSIX file locking (`flock`). The WSL 9P/DrvFs implementation for mounted Windows drives (`/mnt/c`, `/mnt/d`) does not fully or correctly support these POSIX file locks, resulting in `Permission denied (os error 13)`.
* **Whether moving the project into the Linux filesystem would resolve it:** **Yes.** Moving the project from `/mnt/d/...` into the native WSL Linux filesystem (e.g., `~/home4stay` inside `/home/ubuntu`) will resolve this issue completely because the native WSL `ext4` file system fully supports POSIX file locks.

## 2. Root Cause

The `Permission denied (os error 13)` occurs because Rust-based tooling (Turbopack/SWC) in Next.js relies on strict file locking mechanisms to prevent concurrent cache corruption. When running these tools inside a WSL environment against a project located on a mounted Windows partition (`/mnt/d`), the OS translation layer (9P protocol/DrvFs) rejects the lock request, resulting in an immediate `os error 13`.

*(Note: This error can also occur natively on Windows if two Next.js dev servers are running simultaneously on the exact same `.next` directory, as one will lock the trace file and deny access to the other).*

## 3. Evidence
* The error `os error 13` specifically maps to `EACCES` (Permission Denied), which is the exact error thrown by Rust's `std::fs` when `flock()` fails on a 9P mount.
* `mount` output inside your WSL environment confirms that `/mnt/d` is using the `9p` file system type.
* The Next.js 15+ (and Turbopack) architecture enforces strict locking on `.next/trace` and `.next/turbopack` to ensure safe concurrent builds.

## 4. Recommended Fix

**Move the project to the WSL Native Filesystem.**
For optimal performance and compatibility when using WSL, always store your project files in the Linux filesystem (e.g., `~` or `/home/<username>/`). 
1. Close your editors and terminal servers.
2. Inside WSL, run: `cp -r /mnt/d/AAPP/home4stay ~/home4stay`
3. Re-open the project in VS Code using the WSL extension (`code ~/home4stay`).

## 5. Alternative Fixes

* **Alternative 1 (Run strictly on Windows):** If you prefer to keep the project on the `D:\` drive, do not run `npm run dev` or Next.js commands from within the WSL terminal. Run them strictly using standard Windows Command Prompt or PowerShell. Ensure no duplicate servers are running simultaneously.
* **Alternative 2 (Disable Turbopack/Trace):** Sometimes falling back to the Webpack builder (ensuring `--turbo` is not used) or disabling telemetry/tracing can avoid the lockfile creation, though this is not recommended as it degrades Next.js features and performance.

## 6. Risk Assessment
* **Data Loss:** Minimal. The `.next` cache directory is ephemeral and can be safely deleted if it becomes corrupt.
* **Performance:** Running a Node.js/Next.js project on `/mnt/d` from within WSL carries a **massive performance penalty** (often 5x to 10x slower) compared to the native WSL filesystem, due to cross-OS filesystem translation. Moving the project to `~` is highly recommended regardless of the lockfile error.
