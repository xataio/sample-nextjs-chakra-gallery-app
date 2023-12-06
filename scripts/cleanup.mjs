//@ts-check
import { exec } from 'node:child_process';

if (process.argv.length < 3 || process.argv[2] !== '--force') {
  console.log(`❯ ☢️ This deletes all Xata generated files, including the schema history!`);
  console.log(`❯ ⚠️ Please run this command with the --force flag to continue.`);
  process.exit(0);
}

try {
  exec(`rm -rf ./.xata ./utils/xata.ts ./.xatarc`);
} catch {
  console.warn('Cleanup gone wrong.');
}

console.log(`❯ ✅ Cleanup complete.`);
