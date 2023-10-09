import { compact } from 'lodash';
import { Images, TagWithImageCount } from '~/components/images';
import { IMAGES_PER_PAGE_COUNT, IMAGE_SIZE } from '~/utils/constants';
import { getXataClient } from '~/utils/xata';

const xata = getXataClient();

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

export default async function Page({
  params: { id },
  searchParams
}: {
  params: { id: string };
  searchParams: { page: string };
}) {
  const pageNumber = parseInt(searchParams.page) || 1;

  // We use Xata's getPaginated helper to get a paginated list of images matching this tag
  const recordsWithTag = await xata.db['tag-to-image']
    .filter({
      'tag.id': id
    })
    .select(['*', 'image.image'])
    .getPaginated({
      pagination: { size: IMAGES_PER_PAGE_COUNT, offset: IMAGES_PER_PAGE_COUNT * pageNumber - IMAGES_PER_PAGE_COUNT }
    });

  // We use Xata's transform helper to create a thumbnail for each image
  // and apply it to the image object
  const imageRecords = compact(
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

  const tagImageCount = await getTagImageCount(id);

  const tag = await xata.db.tag.read(id);
  const tagWithCount = {
    // Same as above, we use toSerializable to get a plain object for Next.js
    ...tag?.toSerializable(),
    imageCount: tagImageCount
  } as TagWithImageCount;

  const totalNumberOfPages = Math.ceil(tagImageCount / IMAGES_PER_PAGE_COUNT);

  // This page object is needed for building the buttons in the pagination component
  const page = {
    pageNumber,
    hasNextPage: recordsWithTag.hasNextPage(),
    hasPreviousPage: pageNumber > 1,
    totalNumberOfPages: totalNumberOfPages
  };

  const readOnly = process.env.READ_ONLY === 'true';

  return <Images images={imageRecords} tags={[tagWithCount]} page={page} readOnly={readOnly} />;
}
