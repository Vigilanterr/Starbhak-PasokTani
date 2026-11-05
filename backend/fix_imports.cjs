const fs = require('fs');
const path = require('path');

for (const entry of fs.readdirSync('src', { recursive: true })) {
  if (!entry.endsWith('.ts')) continue;
  const full = path.join('src', entry);
  const content = fs.readFileSync(full, 'utf8');
  const fixed = content.replace(/\.ts'/g, "'").replace(/\.ts"/g, '"');
  if (content !== fixed) {
    fs.writeFileSync(full, fixed, 'utf8');
    console.log('Fixed:', full);
  }
}
console.log('Done');
