export const mockTree = [
  { path: 'src/complex.js', type: 'blob', size: 1000, sha: 'sha1' },
  { path: 'src/dup1.js', type: 'blob', size: 500, sha: 'sha2' },
  { path: 'src/dup2.js', type: 'blob', size: 500, sha: 'sha3' },
  { path: 'src/unused.js', type: 'blob', size: 200, sha: 'sha4' },
  { path: 'package.json', type: 'blob', size: 300, sha: 'sha5' },
  { path: 'src/malformed.js', type: 'blob', size: 100, sha: 'sha6' },
  { path: 'node_modules/ignore-me.js', type: 'blob', size: 100, sha: 'sha7' },
  { path: 'image.png', type: 'blob', size: 5000, sha: 'sha8' }
];

export const mockContents = {
  'sha1': `
    function veryComplexFunction(a, b) {
      if (a) {
        if (b) {
          while (a > 0) {
            for (let i = 0; i < 10; i++) {
              if (i % 2 === 0) {
                switch(i) {
                  case 1: break;
                  case 2: break;
                  case 3: break;
                  case 4: break;
                  default: break;
                }
              } else {
                try {
                  const x = a ? b : i;
                  if (x > 5 && a < 10 || b > 2) {
                    console.log('complex');
                  }
                } catch (e) {
                  if (e) console.error(e);
                }
              }
            }
          }
        }
      }
    }
  `,
  'sha2': `
    function processData(data) {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.active && item.score > 50) {
          result.push({
            id: item.id,
            name: item.name.toUpperCase(),
            normalizedScore: item.score / 100,
            timestamp: Date.now()
          });
        }
      }
      return result;
    }
  `,
  'sha3': `
    function processUserData(data) {
      const result = [];
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.active && item.score > 50) {
          result.push({
            id: item.id,
            name: item.name.toUpperCase(),
            normalizedScore: item.score / 100,
            timestamp: Date.now()
          });
        }
      }
      return result;
    }
  `,
  'sha4': `
    export const unusedExport = 'I am not used anywhere';
    export const usedExport = 'I am used';
  `,
  'sha5': JSON.stringify({
    name: "test-repo",
    dependencies: {
      "outdated-package": "^1.0.0",
      "vulnerable-package": "2.1.0",
      "good-package": "3.0.0"
    }
  }),
  'sha6': `
    function brokenSyntax() {
      const x = ;
      return {;
    }
  `
};
