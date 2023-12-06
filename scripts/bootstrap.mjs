import { execSync } from 'child_process';

let cmd = 'node scripts/cleanup.mjs --force && xata init --schema schema.json --codegen=utils/xata.ts';
if (process.env.npm_config_db) {
  cmd += ` --db ${process.env.npm_config_db}`;
}
cmd += ' && node scripts/seed.mjs';

execSync(cmd, { stdio: 'inherit' });
