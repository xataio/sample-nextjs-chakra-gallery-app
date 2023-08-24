import { getXataClient } from '~/utils/xata';

// Next.js edge runtime
// https://nextjs.org/docs/pages/api-reference/edge
export const runtime = 'edge';
export const preferredRegion = 'iad1';

const xata = getXataClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const searchQuery = searchParams.get('query') ?? '';

  // Return results from the tag and image tables
  const results = await xata.search.all(searchQuery, {
    tables: [
      {
        table: 'tag',
        target: [{ column: 'name' }]
      },
      {
        table: 'image',
        target: [{ column: 'name' }]
      }
    ],
    // Add fuzzy search to the query to handle typos
    fuzziness: 1,
    prefix: 'phrase'
  });

  // Return the results as JSON
  return new Response(JSON.stringify(results), {
    headers: { 'Cache-Control': 'max-age=1, stale-while-revalidate=300' }
  });
}
