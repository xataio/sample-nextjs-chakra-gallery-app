import { execSync } from 'child_process';

const args = process.argv.slice(2);
let dbArg = args.find((arg) => arg.startsWith('--db='));

let cmd = 'node scripts/cleanup.mjs --force && xata init --schema schema.json --codegen=utils/xata.ts';
if (dbArg) {
  // Extracting the value from --db=value
  const dbValue = dbArg.split('=')[1];
  cmd += ` --db ${dbValue}`;
}
cmd += ' && node scripts/seed.mjs';

execSync(cmd, { stdio: 'inherit' });
