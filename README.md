## Sample gallery app powered by Xata

A small example Xata application built with Next.js & Chakra UI.

![image](https://github.com/xataio/sample-nextjs-chakra-gallery-app/assets/324519/81590a54-89ed-4003-8e3c-1e38c7831392)

This app showcases serveral [Xata](https://xata.io) features including:

- Offset based pagination
- Form management and submission
- Search
- Aggregations
- Summaries
- Image transformations
- Queries using junction tables and links
- Proper Next.js + Xata TypeScript patterns

## To run this example locally with your own database

You'll need to [install Xata](https://xata.io/docs/getting-started/installation) before performing these steps.

- `git clone git@github.com:xataio/sample-nextjs-chakra-gallery-app.git`
- `cd sample-nextjs-chakra-gallery-app`
- Remove the Xata files that point to our database
  - `rm -rf .xata utils/xata.ts .xatarc`
- `pnpm install`
- Run `xata init --schema schema.json ` to create a new database with the necessary schema
- `pnpm run dev` to load the site at http://localhost:3000
- Add images either through the application, or through your database UI at https://app.xata.io

## Environment variables

After you run init, your `.env` file should look like this

```bash
XATA_BRANCH=main
XATA_API_KEY=xau_yourapikey
```
