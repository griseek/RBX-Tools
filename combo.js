const fs = require('fs');
const path = require('path');

const inputFile = path.join(process.cwd(), 'data', 'input.txt');
const userpassFile = path.join(process.cwd(), 'userpass.txt');
const cookiesFile = path.join(process.cwd(), 'cookies.txt');

try {
    const input = fs.readFileSync(inputFile, 'utf8');
    const lines = input.split('\n');

    const userpass = [];
    const cookies = [];

    lines.forEach(line => {
        const parts = line.split(':');
        if (parts.length >= 3) {
            userpass.push(`${parts[0]}:${parts[1]}`);
            cookies.push(parts.slice(2).join(':'));
        }
    });

    fs.writeFileSync(userpassFile, userpass.join('\n'));
    fs.writeFileSync(cookiesFile, cookies.join('\n'));

    console.log('Extraction complete. Output written to userpass.txt and cookies.txt.');

} catch (error) {
    console.error('An error occurred:', error);
}