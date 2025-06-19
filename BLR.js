const fs = require('fs');
const readline = require('readline');
const path = require('path');

const inputFile = path.join(process.cwd(), 'data', 'input.txt');
const idpassFile = path.join(process.cwd(), 'data', 'idpass.txt');
const outputDir = path.join(process.cwd(), 'product_categories');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read idpass.txt into a map for quick lookups
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

  // Define categories based on the new style filtering: "Kaiser", "Don Lorenzo", "NEL Rin", "Loki", "Sae", "NEL Isagi"
  const categories = {
    'Style_Kaiser': [],
    'Style_Don_Lorenzo': [],
    'Style_NEL_Rin': [],
    'Style_Loki': [],
    'Style_Sae': [],
    'Style_NEL_Isagi': [],
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

    // Extract style information using regex to find "สไตล์ = [StyleName]"
    const styleMatch = cleanLine.match(/สไตล์\s*=\s*(.+?)(?=\s*\||$)/);
    if (styleMatch && styleMatch[1]) {
      const style = styleMatch[1].trim();

      if (style === 'Kaiser') {
        assignedCategory = 'Style_Kaiser';
      } else if (style === 'Don Lorenzo') {
        assignedCategory = 'Style_Don_Lorenzo';
      } else if (style === 'NEL Rin') {
        assignedCategory = 'Style_NEL_Rin';
      } else if (style === 'Loki') {
        assignedCategory = 'Style_Loki';
      } else if (style === 'Sae') {
        assignedCategory = 'Style_Sae';
      } else if (style === 'NEL Isagi') {
        assignedCategory = 'Style_NEL_Isagi';
      }
    }
    
    categories[assignedCategory].push(entry);
  }

  // Write categorized data to respective files
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
