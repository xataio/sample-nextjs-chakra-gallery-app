import { compact } from 'lodash';
import { IMAGES_PER_PAGE_COUNT, IMAGE_SIZE } from '~/utils/constants';
import { getXataClient } from '~/utils/xata';

const xata = getXataClient();

// Next.js edge runtime
// https://nextjs.org/docs/pages/api-reference/edge
export const runtime = 'edge';
export const preferredRegion = 'iad1';

// Xata provides a summarize helper to get the total number of images for a tag
const getTagImageCount = async (id: string) => {
  const summarizeTag = await xata.db['tag-to-image']
    .filter({
      'tag.id': id
    })
    .summarize({
      columns: ['tag'],
      summaries: {
        totalCount: { count: '*' }
      }
    });

  return summarizeTag.summaries[0] ? summarizeTag.summaries[0].totalCount : 0;
};

export async function GET(request: Request, { params }: { params: { tagId: string } }) {
  const { searchParams } = new URL(request.url);
  const { tagId } = params;
  const pageNumber = parseInt(searchParams.get('page') || '1') ?? 1;

  const tagImageCount = await getTagImageCount(tagId);

  // We use Xata's getPaginated helper to get a paginated list of images matching this tag
  const recordsWithTag = await xata.db['tag-to-image']
    .filter({
      'tag.id': tagId
    })
    .select(['*', 'image.image'])
    .getPaginated({
      pagination: { size: IMAGES_PER_PAGE_COUNT, offset: IMAGES_PER_PAGE_COUNT * pageNumber - IMAGES_PER_PAGE_COUNT }
    });

  // We use Xata's transform helper to create a thumbnail for each image
  // and apply it to the image object
  const images = compact(
    recordsWithTag.records.map((record) => {
      if (!record.image?.image) {
        return undefined;
      }
      const { url } = record.image?.image?.transform({
        width: IMAGE_SIZE,
        height: IMAGE_SIZE,
        format: 'auto',
        fit: 'cover',
        gravity: 'top'
      });
      if (!url) {
        return undefined;
      }
      const thumb = {
        url,
        attributes: { width: IMAGE_SIZE, height: IMAGE_SIZE }
      };

      // Next JS requires that we return a serialized object
      // Xata provides a toSerializable method for this purpose
      //
      // In the client side code where this is called we map
      // it back to the ImageRecord type
      return { ...record.image.toSerializable(), thumb };
    })
  );

  const totalNumberOfPages = Math.ceil(tagImageCount / IMAGES_PER_PAGE_COUNT);

  // This page object is needed for building the buttons in the pagination component
  const page = {
    pageNumber,
    hasNextPage: recordsWithTag.hasNextPage(),
    hasPreviousPage: pageNumber > 1,
    totalNumberOfPages: totalNumberOfPages
  };

  // Return the results as JSON
  return new Response(JSON.stringify({ images, page }), {
    headers: { 'Cache-Control': 'max-age=1, stale-while-revalidate=300' }
  });
}
