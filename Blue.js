const fs = require('fs');
const readline = require('readline');
const path = require('path');

const inputFile = path.join(process.cwd(), 'data', 'input.txt');
const idpassFile = path.join(process.cwd(), 'data', 'idpass.txt');
const outputFile = path.join(process.cwd(), 'result.txt');

const idpassMap = {};
const idpassLines = fs.readFileSync(idpassFile, 'utf8').split('\n');
idpassLines.forEach(line => {
    const cleanLine = line.trim();
    if (!cleanLine.includes(':')) return;
    const [rawId, rawPass] = cleanLine.split(':');
    const id = rawId.trim();
    const pass = rawPass.trim();
    if (id && pass) {
        idpassMap[id] = pass;
    }
});

async function process() {
    const rl = readline.createInterface({
        input: fs.createReadStream(inputFile),
        crlfDelay: Infinity
    });

    const filteredEntries = [];

    for await (const line of rl) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;

        const parts = cleanLine.split(/\s+/);
        if (parts.length < 2) continue;

        const id = parts[0];
        const password = idpassMap[id] || 'Password Not Found';

        const levelMatch = line.match(/Lv\s*(\d+)/);
        const level = levelMatch ? parseInt(levelMatch[1], 10) : 0;

        if (level >= 10) {
            filteredEntries.push(`${id}:${password}`);
        }
    }

    let output = "";
    if (filteredEntries.length > 0) {
        output = filteredEntries.join('\n');
    }

    fs.writeFileSync(outputFile, output, 'utf8');
    console.log(`✅ Done. Results written to ${outputFile}`);
}

process();