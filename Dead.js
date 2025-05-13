const fs = require('fs');
const readline = require('readline');
const path = require('path');

const inputFile = path.join( process.cwd(), 'data', 'input.txt');
const idpassFile = path.join( process.cwd(), 'data', 'idpass.txt');
const outputFile = path.join( process.cwd(), 'result.txt');

const idpassMap = {};
try {
  fs.readFileSync(idpassFile, 'utf8')
    .split('\n')
    .forEach(line => {
      const [id, pass] = line.trim().split(':').map(s => s.trim());
      if (id && pass) {
        idpassMap[id] = pass;
      }
    });
} catch (error) {
  console.error(`Error reading or parsing ${idpassFile}:`, error.message);
  process.exit(1);
}

async function processData() {
  const rl = readline.createInterface({
    input: fs.createReadStream(inputFile),
    crlfDelay: Infinity
  });

  const filteredEntries = [];

  try {
    for await (const line of rl) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;

      const parts = cleanLine.split(/\s+/);
      if (parts.length < 2) continue;

      const id = parts[0];
      const password = idpassMap[id] || 'Password Not Found';

      const bondsMatch = line.match(/Bonds:\s*(\d+)/);
      const bonds = bondsMatch ? parseInt(bondsMatch[1], 10) : 0;

      if (bonds >= 5000) {
        filteredEntries.push(`${id}:${password}`);
      }
    }
  } catch (error) {
    console.error(`Error reading or processing ${inputFile}:`, error.message);
    process.exit(1);
  }

  try {
    fs.writeFileSync(outputFile, filteredEntries.join('\n'), 'utf8');
    console.log(`✅ Done. Results written to ${outputFile}`);
  } catch (error) {
    console.error(`Error writing to ${outputFile}:`, error.message);
    process.exit(1);
  }
  rl.close();
}

processData();