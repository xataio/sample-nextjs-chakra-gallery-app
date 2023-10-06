import { JSONData } from '@xata.io/client';
import { pick } from 'lodash';
import { TagRecord, getXataClient } from '~/utils/xata';

// Next.js edge runtime
// https://nextjs.org/docs/pages/api-reference/edge
export const runtime = 'edge';
export const preferredRegion = 'iad1';

const xata = getXataClient();

export type TagWithImageCount = JSONData<TagRecord> & {
  imageCount: number;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tagId = searchParams.get('tagId');
  const filters = tagId ? { 'tag.id': tagId } : {};

  console.time('Fetching topTags with fetch');
  const resp = await fetch(
    'https://sample-databases-v0sn1n.us-east-1.xata.sh/db/gallery-example:main/tables/tag-to-image/summarize',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.XATA_API_KEY}`
      },
      body: JSON.stringify({
        columns: ['tag'],
        summaries: {
          imageCount: { count: '*' }
        },
        sort: [
          {
            imageCount: 'desc'
          }
        ],
        page: {
          size: 10
        }
      })
    }
  );
  const sum = await resp.json();
  console.timeEnd('Fetching topTags with fetch');
  console.log(sum);

  console.time('Fetching topTags with SDK');
  const topTags = await xata.db['tag-to-image'].filter(filters).summarize({
    columns: ['tag'],
    summaries: {
      imageCount: { count: '*' }
    },
    sort: [
      {
        imageCount: 'desc'
      }
    ],
    pagination: {
      size: 10
    }
  });
  console.timeEnd('Fetching topTags with SDK');

  // Find the top 10 tags using Xata's summarize helper
  const tags = topTags.summaries.map((tagSummary) => {
    const tag = tagSummary.tag;
    const serializableTag = pick(tag, ['id', 'name', 'slug']);
    return {
      ...serializableTag,
      imageCount: tagSummary.imageCount
    };
  }) as TagWithImageCount[];

  // Return the results as JSON
  return new Response(JSON.stringify(tags), {
    headers: { 'Cache-Control': 'max-age=1, stale-while-revalidate=300' }
  });
}
