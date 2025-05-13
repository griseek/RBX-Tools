const fs = require('fs');
const path = require('path');

function filterUserPass(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const lines = fileContent.split('\n');

    const userPassPairs = [];

    const userPassRegex = /([a-zA-Z0-9]+:[a-zA-Z0-9_]+)/; // Modified regex

    lines.forEach(line => {
      const match = line.match(userPassRegex);
      if (match) {
        userPassPairs.push(match[1]);
      }
    });
    return userPassPairs;

  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
}

function writeResultsToFile(filePath, results) {
  try {
    const output = results.join('\n');
    fs.writeFileSync(filePath, output, 'utf8');
    console.log(`Results successfully written to ${filePath}`);
  } catch (error) {
    console.error('Error writing to file:', error.message);
  }
}

function main() {
  const inputFilePath = path.join(process.cwd(), 'data', 'input.txt');
  const outputFilePath = path.join(process.cwd(), 'result.txt');

  const results = filterUserPass(inputFilePath);

  if (results.length > 0) {
    writeResultsToFile(outputFilePath, results);
  } else {
    console.log('No username:password pairs found, or error occurred.');
  }
}

main();