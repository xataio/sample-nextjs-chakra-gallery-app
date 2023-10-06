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

export async function GET() {
  console.time('Fetching topTags');

  const topTags = await xata.db['tag-to-image'].summarize({
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
  console.timeEnd('Fetching topTags');

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
