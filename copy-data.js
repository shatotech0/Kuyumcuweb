const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'data');
const destDir = path.join(__dirname, 'dist', 'data');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
for (const file of files) {
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
}
console.log('Data folder copied to dist successfully.');
