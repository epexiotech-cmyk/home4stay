# Redis Connectivity Audit

## 1. Investigation Findings

* **Is Redis running?**
  Yes. Redis is currently running (`/usr/bin/redis-server 127.0.0.1:6379`).
* **Which interface is Redis listening on?**
  Inside WSL, Redis is listening on `127.0.0.1:6379` and `[::1]:6379`. On Windows, the WSL2 relay (`wslrelay.exe`) is actively forwarding port 6379 on `127.0.0.1` and `[::1]`.
* **Is Redis running inside WSL or Windows?**
  Redis is running natively inside the WSL (`Ubuntu-24.04`) environment.
* **What is the configured REDIS_URL?**
  The `.env.local` files specify `REDIS_URL=redis://127.0.0.1:6379`.
* **What host/port is the application using?**
  The application is correctly targeting `127.0.0.1` (IPv4 loopback) on port `6379`.
* **Can Node.js running on Windows connect to Redis inside WSL?**
  Yes. Active TCP connections between Node.js (PID 1140) and `wslrelay.exe` confirm that the application is successfully connected to Redis. Manual tests from Windows to `127.0.0.1:6379` also succeed and return `PONG`.
* **Is firewall or WSL networking involved?**
  No. The WSL localhost forwarding is functioning normally and there are no firewall blocks for `127.0.0.1`.

## 2. Root Cause

The `connect ECONNREFUSED 127.0.0.1:6379` error was caused by a **race condition in startup sequence**. 

Based on process uptimes:
1. The Next.js development server (`npm run dev`) was started first.
2. During the Next.js startup sequence, `checkServices.ts` attempted to ping Redis.
3. The WSL environment (and thus Redis) was started several minutes *after* `npm run dev`.
4. Because Redis was down at the exact moment of Next.js startup, `checkServices.ts` logged the `ECONNREFUSED` error. 
5. Furthermore, because this startup check failed, the execution jumped to the `catch` block, skipping the initialization of background workers (like `bootEmailQueueWorker`).

Even though the underlying `ioredis` client automatically reconnected once Redis came online (which is why there is currently an active connection), the one-time startup logic failed.

## 3. Current Configuration
- **REDIS_URL**: `redis://127.0.0.1:6379` (Correct)
- **WSL Port Forwarding**: Active and working (Correct)
- **Application Logic**: Fails gracefully in dev environment but skips background workers if the initial ping fails.

## 4. Correct Configuration
The existing configuration is entirely correct. No configuration files (`.env.local` or `redis.conf`) need to be modified.

## 5. Required Fix
No code or configuration changes are needed. The development server simply needs to be restarted now that Redis is running. 

## 6. Verification Steps
1. Stop the currently running `npm run dev` terminal command.
2. Ensure WSL and Redis remain running.
3. Start `npm run dev` again.
4. Verify the console outputs:
   - `✅ Redis connected`
   - `✅ Startup check: Redis is reachable`
   - `🚀 All startup validation checks passed successfully!`
