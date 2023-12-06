import { execSync } from 'child_process';

const args = process.argv.slice(2);
const dbIndex = args.indexOf('--db');
let dbValue = null;

if (dbIndex !== -1 && dbIndex < args.length - 1) {
  dbValue = args[dbIndex + 1];
}

let cmd = 'node scripts/cleanup.mjs --force && xata init --schema schema.json --codegen=utils/xata.ts';
if (dbValue) {
  cmd += ` --db ${dbValue}`;
}
cmd += ' && node scripts/seed.mjs';

execSync(cmd, { stdio: 'inherit' });
