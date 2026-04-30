# Disaster Recovery & Rollback Plan

This document outlines the procedures for recovering the Home4Stay platform from critical failures.

## 1. Database Recovery (Point-in-Time Restore)

If data corruption or accidental deletion occurs:

1. **Identify Target Time**: Determine the last known "good" state.
2. **Select Backup**: 
   - Cloud Provider (Vercel/RDS): Use the "Point-in-Time Recovery" (PITR) feature.
   - Manual: Download the latest `.sql.gz` from the S3 backup bucket.
3. **Restore**:
   - Create a temporary DB instance to verify the backup.
   - Once verified, swap the connection string (`DATABASE_URL`).
4. **Verification**: Run the `/api/ready` health check.

## 2. Deployment Rollback

If a new deployment causes critical application errors:

1. **Immediate Revert**: 
   - Vercel: Go to the "Deployments" tab and select "Redeploy" on the previous stable version.
   - Manual: `git checkout <stable-tag> && npm run build && npm run start`.
2. **Post-Mortem**: Check the observability logs for the `fatal` event that triggered the rollback.

## 3. Redis Failure

1. **Cache Purge**: If Redis data is corrupted, flush the cache (`redis.flushall()`).
2. **Degraded Mode**: The application will fallback to database-only validation for rate limiting if configured, but latency may increase.

## 4. Failure Simulation Checklist

Periodically test these scenarios in the staging environment:
- [ ] Pull the plug on the DB connection.
- [ ] Kill the Redis instance.
- [ ] Interrupt a large transaction halfway through to verify rollback.
