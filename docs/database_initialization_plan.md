# Home4Stay Database Initialization Plan

## 1. Root Cause Analysis
The runtime logs indicate `The table 'public.email_jobs' does not exist in the current database`. 
Although the development server successfully connected to the PostgreSQL database (`home4stay`), the database itself is completely empty. The Prisma schema has not yet been synchronized to create the necessary tables, indexes, and relations.

Based on the repository investigation:
*   **Prisma Migration Strategy**: The project **does not** use `prisma migrate dev` or `prisma migrate deploy` because there is no `migrations` directory tracking SQL history inside `apps/main-site/prisma/`. Instead, it relies on `prisma db push` for rapid prototyping and schema synchronization.
*   **Prisma Generate**: `prisma generate` is required to build the TypeScript client, though `prisma db push` typically triggers this automatically.
*   **Seed Scripts**: The project includes two distinct, standalone seed scripts:
    1.  `scripts/seed_all_roles.mjs`: Raw `pg` script to bootstrap system roles (admin, customer, owner, etc.).
    2.  `apps/main-site/prisma/seed-cms.ts`: Prisma-based script to populate initial property CMS structures, gallery assets, and experiences.

## 2. Required Commands & Correct Execution Order
To properly initialize the database from a fresh state, execute the following commands in exact order from the repository root:

**Step 1: Push Schema & Generate Client**
```bash
cd apps/main-site
npx prisma db push
```
*(This will read `prisma/schema.prisma`, create all tables like `email_jobs` in the database, and automatically generate the `@prisma/client` bindings.)*

**Step 2: Bootstrap System Roles**
```bash
cd ../..
node scripts/seed_all_roles.mjs
```
*(This populates the `users` table with core authentication roles required by the CMS script.)*

**Step 3: Seed CMS Content**
```bash
cd apps/main-site
npx tsx prisma/seed-cms.ts
```
*(This uses the generated Prisma client to create the "Shivay Resort" demo property, mapping the `owner` role created in Step 2 to the new property.)*

## 3. Risks
*   **Data Loss (Low in Dev)**: `prisma db push` forcefully synchronizes the database schema. In a production environment, this can drop columns or tables if the schema drifts. However, in a fresh local development environment, it is entirely safe.
*   **Idempotency**: Both seed scripts (`seed_all_roles.mjs` and `seed-cms.ts`) utilize `UPSERT` logic (e.g., checking if an email exists before inserting, or using `prisma.*.upsert`). They are safe to run multiple times without causing duplicate key crashes.

## 4. Rollback Plan
If the initialization gets corrupted or you wish to start over with a clean slate:
```bash
# Wipe the database and re-push the schema cleanly
cd apps/main-site
npx prisma db push --force-reset
```
Alternatively, recreate the database via WSL:
```bash
wsl -u root --exec bash -c "sudo -u postgres dropdb home4stay && sudo -u postgres createdb home4stay"
```

## 5. Verification
After executing the initialization steps:
1. Run `npm run dev` from the root.
2. Monitor the startup logs in the terminal.
3. Verify that the `[EmailQueueWorker] Unhandled loop tick exception: Error [PrismaClientKnownRequestError]: The table 'public.email_jobs' does not exist` log **no longer appears**. 
4. Navigate to `http://localhost:3000` to verify the application loads seamlessly.
