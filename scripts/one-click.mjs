//@ts-check
import dotenv from 'dotenv';
import { exec } from 'node:child_process';

dotenv.config({
  path: '.env.local'
});

try {
  console.log(`❯ Setting up database at ${process.env.XATA_DATABASE_URL}`);

  exec(
    `pnpm -s dlx @xata.io/cli@latest init --schema=schema.json --codegen=utils/xata.ts --db=${process.env.XATA_DATABASE_URL} --yes`,
    (_error, stdout, stderr) => {
      console.log('❯ Running pnpm dlx');

      if (stderr) {
        console.error(`Finished with issues: \n${stderr}`);
        return;
      }
      console.log(stdout);
    }
  );
} catch {
  console.warn('Setup gone wrong.');
}
