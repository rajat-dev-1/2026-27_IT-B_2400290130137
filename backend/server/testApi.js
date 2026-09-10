import { db } from './src/config/database.js';
import { getRepositoryFiles, getRepositoryIssues } from './src/controllers/repositoryController.js';

async function test() {
  const req = {
    repository: {
      id: '04d2322b-e8ff-4254-a497-71438221b1ae',
      lastScanId: 'a59400ea-388d-4c8a-9ecb-6e3d94d3c2fc'
    }
  };

  const next = (err) => { if(err) console.error("Error:", err); };

  console.log("Testing getRepositoryFiles...");
  await getRepositoryFiles(req, {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { console.log("Files response length:", data.data.length); return this; }
  }, next);

  console.log("Testing getRepositoryIssues...");
  await getRepositoryIssues(req, {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { console.log("Issues response length:", data.data.length); return this; }
  }, next);
  
  process.exit(0);
}

test();
