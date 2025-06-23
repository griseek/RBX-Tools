const fs = require('fs');
const readline = require('readline');
const path = require('path');

const inputFile = path.join(process.cwd(), 'data', 'input.txt');
const idpassFile = path.join(process.cwd(), 'data', 'idpass.txt');
const outputDir = path.join(process.cwd(), 'product_categories');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

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

    const categories = {
        '10k': [],
        '20k': [],
        '30k': []
    };

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

            const entry = `${id}:${password}`;

            if (bonds >= 10000 && bonds <= 20000) {
                categories['10k'].push(entry);
            } else if (bonds >= 20001 && bonds <= 30000) {
                categories['20k'].push(entry);
            } else if (bonds > 30000) {
                categories['30k'].push(entry);
            }
        }
    } catch (error) {
        console.error(`Error reading or processing ${inputFile}:`, error.message);
        process.exit(1);
    }

    for (const categoryName in categories) {
        if (categories[categoryName].length > 0) {
            const outputFileName = path.join(outputDir, `${categoryName}.txt`);
            try {
                fs.writeFileSync(outputFileName, categories[categoryName].join('\n'), 'utf8');
                console.log(`✅ Results for ${categoryName} written to ${outputFileName}`);
            } catch (error) {
                console.error(`Error writing to ${outputFileName}:`, error.message);
            }
        }
    }
    console.log('✅ Processing complete. Results written to product_categories directory.');
    rl.close();
}

processData();
