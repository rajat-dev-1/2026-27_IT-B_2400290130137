import { and, eq, desc } from 'drizzle-orm';
import { db } from '../config/database.js';
import { scans } from '../db/schema/scans.js';
import { logger } from '../utils/logger.js';

/**
 * Finds an existing scan by repository ID and commit SHA.
 */
export async function getScanByRepoAndCommit(repositoryId, commitSha) {
  const result = await db.select().from(scans).where(
    and(
      eq(scans.repositoryId, repositoryId),
      eq(scans.commitSha, commitSha)
    )
  ).orderBy(desc(scans.runNumber)).limit(1);

  return result[0] || null;
}

/**
 * Attempts to create a new scan record. Handles conflicts safely.
 * If data.isRescan is true, we find the max runNumber and increment it.
 */
export async function createScanRecord(data) {
  const MAX_RETRIES = 3;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      let nextRunNumber = 1;
      
      const latestScan = await db.select({ runNumber: scans.runNumber })
        .from(scans)
        .where(and(eq(scans.repositoryId, data.repositoryId), eq(scans.commitSha, data.commitSha)))
        .orderBy(desc(scans.runNumber))
        .limit(1);
        
      if (latestScan.length > 0) {
        nextRunNumber = latestScan[0].runNumber + (data.isRescan ? 1 : 0);
        if (!data.isRescan) {
          // If not a rescan and a record exists, we should not insert, we return null indicating conflict
          return null;
        }
      }
      
      const insertData = { ...data, runNumber: nextRunNumber };
      const result = await db.insert(scans).values(insertData).onConflictDoNothing({
        target: [scans.repositoryId, scans.commitSha, scans.runNumber]
      }).returning();
  
      if (result.length > 0) {
        return result[0];
      }
      // If we reach here, onConflictDoNothing prevented insert because another process took that runNumber.
      // Loop will retry.
    } catch (error) {
      logger.error({ err: error, event: 'db.insert_scan_error' }, 'Error inserting scan record');
      throw error;
    }
  }
  return null;
}

/**
 * Updates a scan record by ID.
 */
export async function updateScanRecord(scanId, data) {
  const result = await db.update(scans)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(scans.id, scanId))
    .returning();
    
  return result[0];
}

/**
 * Gets a scan by its ID and user ID.
 */
export async function getScanByIdAndUserId(scanId, userId) {
  const result = await db.select().from(scans).where(
    and(
      eq(scans.id, scanId),
      eq(scans.userId, userId)
    )
  ).limit(1);

  return result[0] || null;
}
