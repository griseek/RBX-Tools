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
    'Style_Nel_Rin': [],
    'Style_Sae': [],
    'Style_Nel_Isagi': [],
    'Style_Don_Lorenzo': [],
    'Style_Kaiser': [],
    'Other_Categories': []
  };

  for await (const line of rl) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    const columns = cleanLine.split('\t').length > 1 ? cleanLine.split('\t') : cleanLine.split(/ {2,}/);

    const id = columns[0] || cleanLine.split(/\s+/)[0];
    const password = idpassMap[id] || 'Password Not Found';
    const entry = `${id}:${password}`;

    let assignedCategory = 'Other_Categories';

    const styleMatch = cleanLine.match(/สไตล์\s*=\s*(.+?)(?=\s*\||$)/);
    if (styleMatch && styleMatch[1]) {
      const style = styleMatch[1].trim();

      if (style === 'Nel Rin') {
        assignedCategory = 'Style_Nel_Rin';
      } else if (style === 'Sae') {
        assignedCategory = 'Style_Sae';
      } else if (style === 'Nel Isagi') {
        assignedCategory = 'Style_Nel_Isagi';
      } else if (style === 'Don Lorenzo') {
        assignedCategory = 'Style_Don_Lorenzo';
      } else if (style === 'Kaiser') {
        assignedCategory = 'Style_Kaiser';
      }
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