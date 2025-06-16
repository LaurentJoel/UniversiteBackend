import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.production') });

console.log('🔍 Environment variables test:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'LOADED' : 'NOT LOADED');
console.log('NODE_ENV:', process.env.NODE_ENV);

console.log('\n📁 File paths:');
console.log('Current file:', __filename);
console.log('Current dir:', __dirname);
console.log('Expected env file:', path.join(__dirname, '..', '..', '.env.production'));

import fs from 'fs';
const envPath = path.join(__dirname, '..', '..', '.env.production');
console.log('Env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('Env file contents:');
  console.log(fs.readFileSync(envPath, 'utf8').split('\n').map(line => 
    line.includes('PASSWORD') ? line.replace(/=.*/, '=***') : line
  ).join('\n'));
}
