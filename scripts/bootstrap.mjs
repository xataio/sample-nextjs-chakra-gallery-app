import { execSync } from 'child_process';

const args = process.argv.slice(2);

function getArgumentValue(key) {
  const index = args.indexOf(key);
  if (index !== -1 && index < args.length - 1) {
    return args[index + 1];
  }
  return null;
}

const dbValue = getArgumentValue('--db');
const profileValue = getArgumentValue('--profile');

let cmd = 'node scripts/cleanup.mjs --force && xata init --schema schema.json --codegen=utils/xata.ts';
if (dbValue) {
  cmd += ` --db ${dbValue}`;
}
if (profileValue) {
  cmd += ` --profile ${profileValue}`;
}
cmd += ' && node scripts/seed.mjs';

execSync(cmd, { stdio: 'inherit' });
