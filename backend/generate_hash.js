// ===== Generate Password Hash for Testing =====
const bcrypt = require('bcrypt');

const passwords = [
  { name: 'admin123', pass: 'admin123' },
  { name: 'password123', pass: 'password123' },
  { name: '1234', pass: '1234' },
  { name: 'test1234', pass: 'test1234' }
];

async function generateHashes() {
  console.log('===== Password Hashes =====\n');

  for (const item of passwords) {
    const hash = await bcrypt.hash(item.pass, 10);
    console.log(`Password: "${item.name}"`);
    console.log(`Hash: ${hash}`);
    console.log('---');
  }
}

generateHashes();
