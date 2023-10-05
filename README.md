## Live demo

A live demo of this application is available at [https://xata-gallery.vercel.app](https://xata-gallery.vercel.app). The demo turns off the ability to upload and delete images. For local or forked versions, set the `.env` setting `READ_ONLY=false`.

## Sample gallery app powered by Xata

A small example Xata application built with Next.js & Chakra UI.

![image](https://github.com/xataio/sample-nextjs-chakra-gallery-app/assets/324519/47727874-318f-4451-a670-f456e85a09df)

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
- Run `xata init --schema schema.json --codegen=utils/xata.ts` to create a new database with the necessary schema. When creating the database, choose `us-east-1` as the region. If you pick another region, you will need to add it to `next.config.js`.
- `pnpm run dev` to load the site at http://localhost:3000
- Add images either through the application, or through your database UI at https://app.xata.io

## Environment variables

After you run init, your `.env` file should look like this

```bash
# Xata credentials
XATA_BRANCH=main
XATA_API_KEY=

# Setting to true will disable API / UI to write to the database
READ_ONLY=false
```
