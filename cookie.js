const fs = require('fs');
const path = require('path');

const filterAndExtract = (comboFile, idpassFile, matchedResultFile, unmatchedResultFile) => {
    let idpassIds;

    try {
        const idpassData = fs.readFileSync(idpassFile, 'utf8');
        idpassIds = new Set(idpassData.split('\n').map(line => line.trim()));
    } catch (err) {
        console.error(`Error reading ${idpassFile}: ${err.message}`);
        return;
    }

    try {
        const comboData = fs.readFileSync(comboFile, 'utf8');
        const lines = comboData.split('\n');
        let matchedResults = '';
        let unmatchedResults = '';

        for (const line of lines) {
            const parts = line.trim().split(':');
            if (parts.length > 2) {
                const identifier = `${parts[0]}:${parts[1]}`;
                const extractedValue = parts.slice(2).join(':');
                if (idpassIds.has(identifier)) {
                    matchedResults += identifier + ":" + extractedValue + '\n';
                } else {
                    unmatchedResults += identifier + ":" + extractedValue + '\n';
                }
            }
        }

        fs.writeFileSync(matchedResultFile, matchedResults.trim()); // Trim to remove trailing newline
        fs.writeFileSync(unmatchedResultFile, unmatchedResults.trim()); // Trim to remove trailing newline

    } catch (err) {
        console.error(`Error processing files: ${err.message}`);
        return;
    }

    console.log(`Successfully filtered and extracted data.`);
    console.log(`Matched results saved to ${matchedResultFile}`);
    console.log(`Unmatched results saved to ${unmatchedResultFile}`);
};

if (require.main === module) {
    const dataDir = path.join(process.cwd(), 'data');
    const comboFile = path.join(dataDir, 'combo.txt');
    const idpassFile = path.join(dataDir, 'idpass.txt');
    const matchedResultFile = path.join(process.cwd(), 'matched.txt');
    const unmatchedResultFile = path.join(process.cwd(), 'unmatched.txt');

    filterAndExtract(comboFile, idpassFile, matchedResultFile, unmatchedResultFile);
}