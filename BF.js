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
      const cleanLine = line.trim();
      if (!cleanLine.includes(':')) return;
      const [id, pass] = cleanLine.split(':').map(part => part.trim());
      if (id && pass) {
        idpassMap[id] = pass;
      }
    });
} catch (error) {
  console.error(`Error reading idpass.txt: ${error.message}. Please ensure idpass.txt exists and is correctly formatted.`);
  process.exit(1);
}

async function processData() {
  const rl = readline.createInterface({
    input: fs.createReadStream(inputFile),
    crlfDelay: Infinity
  });

  const categories = {
    'GOD_Only': [],
    'GOD_and_CDK': [],
    'GOD_MIR_and_VAL': [],
    'GOD_MIR_VAL_and_CDK': [],
    'Yeti': [],
    'Gas': [],
    'Leopard': [],
    'Kitsune': [],
    'Other_Categories': []
  };

  for await (const line of rl) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    let typeString = '';
    let columns = cleanLine.split('\t');

    if (columns.length < 3) {
        columns = cleanLine.split(/ {2,}/);
    }

    if (columns.length >= 2) {
        let potentialType = columns[1].trim();

        const cleanupMatch = potentialType.match(/(.+?)(?=\s+\d{1,3}(?:,\d{3})*|\s*\[\d+\]|\s+GOD\s*\[\d+\]|$)/);
        if (cleanupMatch && cleanupMatch[1]) {
            typeString = cleanupMatch[1].trim();
        } else {
            typeString = potentialType;
        }

    } else {
        const id = columns[0] || cleanLine.split(/\s+/)[0];
        const password = idpassMap[id] || 'Password Not Found';
        const entry = `${id}:${password}`;
        categories['Other_Categories'].push(entry);
        continue;
    }

    const id = columns[0] || cleanLine.split(/\s+/)[0];
    const password = idpassMap[id] || 'Password Not Found';
    const entry = `${id}:${password}`;

    const hasGod = typeString.includes('GOD') ||
                   line.includes('GOD [') ||
                   line.includes(' [6]');

    const hasCdk = typeString.includes('CDK');
    const hasMir = typeString.includes('MIR');
    const hasVal = typeString.includes('VAL');
    const hasOtherPrimaryTypes = typeString.includes('ELTC') || typeString.includes('SMK');

    let assignedCategory = 'Other_Categories';

    if (cleanLine.includes('Yeti')) {
      assignedCategory = 'Yeti';
    } else if (cleanLine.includes('Gas')) {
      assignedCategory = 'Gas';
    } else if (cleanLine.includes('Leopard')) {
      assignedCategory = 'Leopard';
    } else if (cleanLine.includes('Kitsune')) {
      assignedCategory = 'Kitsune';
    } else if (hasGod && hasCdk && hasMir && hasVal) {
      assignedCategory = 'GOD_MIR_VAL_and_CDK';
    } else if (hasGod && hasMir && hasVal) {
      assignedCategory = 'GOD_MIR_and_VAL';
    } else if (hasGod && hasCdk) {
      assignedCategory = 'GOD_and_CDK';
    } else if (hasGod && !hasCdk && !hasVal && !hasOtherPrimaryTypes) {
      assignedCategory = 'GOD_Only';
    }

    categories[assignedCategory].push(entry);
  }

  for (const categoryName in categories) {
    if (categories[categoryName].length > 0) {
      const outputFileName = path.join(outputDir, `${categoryName}.txt`);
      fs.writeFileSync(outputFileName, categories[categoryName].join('\n'));
    }
  }

  console.log('✅ Processing complete. Results written to product_categories directory.');
}

processData().catch(err => {
  console.error('An error occurred:', err);
});
