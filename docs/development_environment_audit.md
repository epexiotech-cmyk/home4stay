# Home4Stay Development Environment Audit

## 1. Executive Summary
This audit evaluated the local development environment for the Home4Stay project across 15 key areas. The environment is **Not Ready** for active development due to several critical configuration issues, missing dependencies in the primary WSL shell, and a broken database connection. While the underlying services (PostgreSQL, Redis) are running, Node.js is missing from the WSL environment, the database does not exist, and there is a package manager configuration mismatch.

## 2. Environment Matrix
| Component | Status | Detected Version / Value |
| :--- | :--- | :--- |
| **OS (Host)** | PASS | Windows 11 Home Single Language (10.0.26200) |
| **WSL Integration** | WARNING | Ubuntu-24.04 (Running), but missing core tools |
| **Node.js (Windows)** | WARNING | v24.13.0 (Project targets ~v20 based on types) |
| **Node.js (WSL)** | FAIL | Not installed |
| **Package Manager** | FAIL | npm (11.13.0) and pnpm (11.15.1) conflict |
| **Git (Windows)** | PASS | 2.52.0.windows.1 |
| **Database** | FAIL | PostgreSQL 18.4 (WSL) - DB missing, auth fails |
| **Redis** | PASS | Running on port 6379 (WSL) |
| **Next.js** | PASS | 16.2.4 |
| **Prisma** | WARNING | CLI (6.19.3) / Client (6.4.1) mismatch |

## 3. Passed Checks
- **Redis**: Installed and running in WSL. Accessible from Windows on port 6379 (`redis-cli ping` returns PONG).
- **Next.js**: Configured with App Router, TypeScript, and Tailwind CSS.
- **Development Tools**: ESLint, PostCSS, and TypeScript configurations are present in `apps/main-site`.
- **Ports**: Ports 3000, 5432, and 6379 are open and accessible from the host.

## 4. Warnings
- **Node.js Version**: Node v24.13.0 is installed on Windows. The project's `@types/node` dependency suggests Node 20 is expected. Node 24 may cause compatibility issues with Next.js 16 and other dependencies.
- **Environment Variables**: `.env.local` is present, but missing `GOOGLE_CLIENT_ID` defined in `.env.example`.
- **Prisma Versions**: The Prisma CLI version (6.19.3) does not match the `@prisma/client` version (6.4.1).

## 5. Failures
- **WSL Node Environment**: Node.js, npm, and pnpm are completely missing from the Ubuntu-24.04 WSL environment. If the intent is to develop inside WSL, this is a blocker.
- **Package Manager Conflict**: 
  - `package.json` specifies npm workspaces (`"workspaces": ["apps/*", "packages/*"]`).
  - Both `package-lock.json` and `pnpm-lock.yaml` exist.
  - `pnpm-workspace.yaml` exists but is improperly configured (missing the `packages:` array entirely).
- **Database Connection**: 
  - The `home4stay` database does not exist in PostgreSQL.
  - The connection URL `postgresql://postgres:postgres@localhost:5432/home4stay` fails with a password authentication error for the `postgres` user.

## 6. Missing Components
- Node.js in WSL
- `home4stay` database in PostgreSQL
- `.env` file (currently only `.env.local` exists, which is acceptable for Next.js, but standard scripts often expect `.env`)
- `packages` array in `pnpm-workspace.yaml`

## 7. Version Compatibility
- Node.js (Windows) is on v24, which is very new. Recommend downgrading to LTS v20.
- `@prisma/client` (6.4.1) and `prisma` CLI (6.19.3) are misaligned.
- Mixing `npm run` inside scripts (e.g., `dev` script in root `package.json`) with `pnpm` files.

## 8. Security Observations
- The `DATABASE_URL` uses the default `postgres:postgres` credentials.
- `JWT_SECRET` in `.env.local` is a placeholder. This is acceptable for local dev but must not be pushed.

## 9. Performance Observations
- Using both `npm` and `pnpm` can bloat the `node_modules` directory and cause resolution slowdowns/errors due to differing install architectures.

## 10. Recommended Fixes

### Fix 1: Resolve Package Manager Conflict
Choose either `npm` or `pnpm`. Since `pnpm-lock.yaml` is present, let's assume `pnpm` is intended.
```bash
# 1. Delete npm lockfile and node_modules
rm package-lock.json
rm -rf node_modules apps/main-site/node_modules

# 2. Fix pnpm-workspace.yaml
echo "packages:
  - 'apps/*'
  - 'packages/*'" >> pnpm-workspace.yaml

# 3. Reinstall dependencies
pnpm install
```

### Fix 2: Install Node.js in WSL (If developing in WSL)
```bash
# In WSL Ubuntu-24.04
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Fix 3: Fix Database Connection and Setup
```bash
# In WSL Ubuntu-24.04: Change postgres password and create DB
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres createdb home4stay

# Push Prisma schema from Windows
npx prisma db push --schema=apps/main-site/prisma/schema.prisma
```

### Fix 4: Align Prisma Versions
```bash
pnpm update prisma@latest @prisma/client@latest
```

## 11. Overall Readiness Score (0–100)
**Score: 35/100**

## 12. Final Verdict
**Not Ready**
The environment requires fixing the Node.js installation in WSL, resolving the package manager conflict, setting up the PostgreSQL database, and fixing the database authentication credentials before development can begin.
