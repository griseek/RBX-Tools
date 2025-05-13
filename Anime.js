const fs = require('fs');
const readline = require('readline');
const path = require('path');

const inputFile = path.join(process.cwd(), 'data', 'input.txt');
const idpassFile = path.join(process.cwd(), 'data', 'idpass.txt');
const outputFile = path.join(process.cwd(), 'result.txt');

const idpassMap = {};
fs.readFileSync(idpassFile, 'utf8')
  .split('\n')
  .forEach(line => {
    const cleanLine = line.trim();
    if (!cleanLine.includes(':')) return;
    const [id, pass] = cleanLine.split(':').map(part => part.trim());
    if (id && pass) {
      idpassMap[id] = pass;
    }
  });

async function processData() {
  const rl = readline.createInterface({
    input: fs.createReadStream(inputFile),
    crlfDelay: Infinity
  });

  const aceEntries = [];

  for await (const line of rl) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    const parts = cleanLine.split(/\s+/);
    if (parts.length < 2) continue;

    const id = parts[0];
    const password = idpassMap[id] || 'Password Not Found';
    const entry = `${id}:${password}`;

    if (cleanLine.includes('Ace')) {
      aceEntries.push(entry);
    }
  }

  fs.writeFileSync(outputFile, aceEntries.join('\n'));
  console.log('✅ Processing complete. Results written to result.txt');
}

processData().catch(err => {
  console.error('An error occurred:', err);
});