import request from 'supertest';
import app from '../server/src/app.js';
import { db } from '../server/src/config/database.js';
import { users } from '../server/src/db/schema/users.js';
import { repositories } from '../server/src/db/schema/repositories.js';
import jwt from 'jsonwebtoken';
import { env } from '../server/src/config/env.js';
import crypto from 'crypto';
import { encryptSecret } from '../server/src/utils/crypto.js';
import { eq } from 'drizzle-orm';

async function testScanRoute() {
  const userId = crypto.randomUUID();
  const repoId = crypto.randomUUID();

  try {
    // 1. Setup user and repo
    await db.insert(users).values({
      id: userId,
      githubId: 12345,
      githubUsername: 'testuser',
      encryptedAccessToken: encryptSecret('fake-token')
    });

    await db.insert(repositories).values({
      id: repoId,
      githubRepoId: 67890,
      name: 'test-repo',
      fullName: 'testuser/test-repo',
      owner: 'testuser',
      defaultBranch: 'main',
      isPrivate: false,
      userId: userId,
    });

    const token = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '1h' });

    // 2. Make the same request the frontend makes (NO BODY)
    console.log(`Sending POST /api/repositories/${repoId}/scans`);
    const response = await request(app)
      .post(`/api/repositories/${repoId}/scans`)
      .set('Authorization', `Bearer ${token}`);
      // no .send() because frontend doesn't send a body

    console.log('Response Status:', response.status);
    console.log('Response Body:', JSON.stringify(response.body, null, 2));

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    // Cleanup
    await db.delete(repositories).where(eq(repositories.id, repoId));
    await db.delete(users).where(eq(users.id, userId));
    process.exit(0);
  }
}

testScanRoute();
