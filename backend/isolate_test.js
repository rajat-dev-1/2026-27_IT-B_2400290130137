import dotenv from 'dotenv';
dotenv.config();

import { db } from './server/src/config/database.js';
import { repositories } from './server/src/db/schema/repositories.js';
import { users } from './server/src/db/schema/users.js';
import { eq } from 'drizzle-orm';
import { Octokit } from '@octokit/rest';

async function run() {
  const [repo] = await db.select().from(repositories).where(eq(repositories.id, 'fe92cc1b-ea65-442e-87e5-65f94888307c'));
  if (!repo) {
    console.log('Repo not found in DB');
    process.exit(1);
  }
  
  const [user] = await db.select().from(users).where(eq(users.id, repo.userId));
  
  console.log('Repo owner:', repo.owner, 'name:', repo.name);
  console.log('Token exists:', !!user.encryptedAccessToken);
  
  const token = user.encryptedAccessToken;
  
  try {
    const res = await fetch('https://api.github.com/repos/' + repo.owner + '/' + repo.name, {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    console.log('Status:', res.status);
    const body = await res.json();
    console.log('Body:', JSON.stringify(body, null, 2));

    if (res.status === 200) {
      console.log('Has commits (default branch):');
      const commitsRes = await fetch('https://api.github.com/repos/' + repo.owner + '/' + repo.name + '/commits?per_page=1', {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      console.log('Commits status:', commitsRes.status);
      const commitsBody = await commitsRes.json();
      console.log('Commits length:', commitsBody.length);
      if (commitsBody.length === 0) {
        console.log('Empty repository / no commits on default branch');
      } else {
         console.log('First commit:', commitsBody[0]?.sha);
      }
    }

  } catch(e) {
    console.log('Fetch error:', e);
  }
  process.exit(0);
}

run();
