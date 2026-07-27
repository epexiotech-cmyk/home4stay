# Home4Stay Environment Fix Plan

This document outlines the step-by-step implementation plan to resolve the verified issues blocking the Home4Stay development environment. **No changes have been applied yet.**

---

## Phase 1: Database Authentication Mismatch

### 1. Root Cause
The `DATABASE_URL` in `.env.local` defaults to `postgresql://postgres:postgres@localhost:5432/home4stay`. While the `home4stay` database exists, the `postgres` user requires a different password than the default "postgres" string, causing connection attempts to fail with `password authentication failed`.

### 2. Risk Assessment
- **Risk Level**: Low.
- Modifying local environment variables has no impact on production. The only risk is if the correct password cannot be found, which would necessitate modifying the PostgreSQL user's password directly.

### 3. Files Affected
- `.env.local`

### 4. Exact Implementation Steps
1. **Primary approach (Configuration only)**: Update the password section of `DATABASE_URL` in `.env.local` to match the actual password of your local `postgres` user.
   ```env
   # Update this line in .env.local
   DATABASE_URL=postgresql://postgres:<YOUR_ACTUAL_PASSWORD>@localhost:5432/home4stay
   ```
2. **Fallback approach (If password is unknown)**: Connect to PostgreSQL as the `postgres` user via WSL root, and reset the password to match the config:
   ```bash
   wsl -u root --exec bash -c "sudo -u postgres psql -c \"ALTER USER postgres PASSWORD 'postgres';\""
   ```

### 5. Verification Steps
- Run `npx prisma db pull`. If it successfully connects and introspects the database without authentication errors, the fix is verified.

### 6. Rollback Plan
- Revert `.env.local` to the default `DATABASE_URL` string (`postgres:postgres`).

---

## Phase 2: TypeScript Build Failure

### 1. Root Cause
In `apps/main-site/src/components/onboarding/PreviewRenderer.tsx` at line 175, the code attempts to access `property.tagline`. The `property` object is memoized using `draftData.property || { title: "", location: "", description: "", slug: "" }`. Because the fallback object lacks a `tagline` property, TypeScript infers a union type where `tagline` might not exist, causing a strict type-checking failure during the build.

### 3. Risk Assessment
- **Risk Level**: Very Low.
- Adding a missing optional property to a default fallback object is completely safe and only affects the initial render state before real data is populated.

### 3. Files Affected
- `apps/main-site/src/components/onboarding/PreviewRenderer.tsx`

### 4. Exact Implementation Steps
Modify line 118 in `PreviewRenderer.tsx` to include `tagline: ""` in the fallback object:
```diff
- const property = useMemo(() => draftData.property || { title: "", location: "", description: "", slug: "" }, [draftData.property]);
+ const property = useMemo(() => draftData.property || { title: "", location: "", description: "", tagline: "", slug: "" }, [draftData.property]);
```

### 5. Verification Steps
- Run `npm run build` from the project root. The build should complete successfully without any TypeScript errors in `PreviewRenderer.tsx`.

### 6. Rollback Plan
- Restore the original fallback object ` { title: "", location: "", description: "", slug: "" }` using git checkout.

---

## Phase 3: Package Manager Standardization

### 1. Root Cause
The repository contains artifacts for two different package managers (`package-lock.json` and `pnpm-lock.yaml`).
- **Official Manager**: The project is officially an **npm** workspace. The root `package.json` defines workspaces using npm syntax, and the root scripts utilize `npm run`. Additionally, `npm ls -ws` correctly resolves the workspace graph.
- **The Issue**: `pnpm` is present but completely misconfigured (`pnpm-workspace.yaml` is missing the `packages` definition), causing `pnpm install` to ignore all monorepo apps and packages. 

### 2. Risk Assessment
- **Risk Level**: Low.
- Deleting unused lockfiles prevents tooling confusion (like Vercel or GitHub Actions using the wrong package manager) and ensures all developers use the correct dependency tree.

### 3. Files Affected
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`

### 4. Exact Implementation Steps
1. Delete the extraneous pnpm files from the root directory:
   ```cmd
   del pnpm-lock.yaml
   del pnpm-workspace.yaml
   ```
2. Re-run `npm install` to ensure the official `package-lock.json` is perfectly synced with the current `node_modules` state.

### 5. Verification Steps
- Verify `pnpm-lock.yaml` is gone.
- Ensure `npm install` succeeds and correctly links workspace packages like `apps/main-site` to `node_modules`.

### 6. Rollback Plan
- Restore the deleted files from source control via `git checkout pnpm-lock.yaml pnpm-workspace.yaml`.
