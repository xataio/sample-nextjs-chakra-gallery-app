import { compact, pick } from 'lodash';
import { Images, TagWithImageCount } from '~/components/images';
import { IMAGES_PER_PAGE_COUNT, IMAGE_SIZE } from '~/utils/constants';
import { getXataClient } from '~/utils/xata';

const xata = getXataClient();

// Using Xata's aggregate helper, we can get the total number of images
const getImageCount = async () => {
  const totalNumberOfImages = await xata.db.image.summarize({
    columns: [],
    summaries: {
      count: { count: '*' }
    }
  });
  return totalNumberOfImages.summaries[0].count;
};

export default async function Page({ searchParams }: { searchParams: { page: string } }) {
  const pageNumber = parseInt(searchParams.page) || 1;

  // We use Xata's getPaginated helper to get a paginated list of images, sorted by date
  const imagesPagePromise = xata.db.image.sort('xata.createdAt', 'desc').getPaginated({
    pagination: { size: IMAGES_PER_PAGE_COUNT, offset: IMAGES_PER_PAGE_COUNT * pageNumber - IMAGES_PER_PAGE_COUNT }
  });

  const imageCountPromise = getImageCount();

  // We use Xata's summarize helper to get the top 10 tags,
  // and create a property for each tag called imageCount
  const topTagsPromise = xata.db['tag-to-image'].summarize({
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

  console.time('Fetching images');
  const [imagesPage, imageCount, topTags] = await Promise.all([imagesPagePromise, imageCountPromise, topTagsPromise]);
  console.timeEnd('Fetching images');

  const totalNumberOfPages = Math.ceil(imageCount / IMAGES_PER_PAGE_COUNT);

  // This page object is needed for building the buttons in the pagination component
  const page = {
    pageNumber,
    hasNextPage: imagesPage.hasNextPage(),
    hasPreviousPage: pageNumber > 1,
    totalNumberOfPages
  };

  // We use Xata's transform helper to create a thumbnail for each image
  // and apply it to the image object
  console.time('Fetching images transforms');
  const images = compact(
    await Promise.all(
      imagesPage.records.map(async (record) => {
        if (!record.image) {
          return undefined;
        }

        const { url } = record.image.transform({
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          format: 'auto',
          fit: 'cover',
          gravity: 'top'
        });

        // Since the resulting image will be a square, we don't really need to fetch the metadata in this case.
        // The meta data provides both the original and transformed dimensions of the image.
        // If you don't know the dimensions of the transform image, you can get them with a request
        // like this. The metadataUrl you get from the transform() call.
        // const metadata = await fetchMetadata(metadataUrl);

        if (!url) {
          return undefined;
        }

        const thumb = {
          url,
          attributes: {
            width: IMAGE_SIZE, // Post transform width
            height: IMAGE_SIZE // Post transform height
          }
        };

        return { ...record.toSerializable(), thumb };
      })
    )
  );
  console.timeEnd('Fetching images transforms');

  // Find the top 10 tags using Xata's summarize helper
  const tags = topTags.summaries.map((tagSummary) => {
    const tag = tagSummary.tag;
    const serializableTag = pick(tag, ['id', 'name', 'slug']);
    return {
      ...serializableTag,
      imageCount: tagSummary.imageCount
    };
  }) as TagWithImageCount[];

  const readOnly = process.env.READ_ONLY === 'true';

  return <Images images={images} tags={tags} page={page} readOnly={readOnly} />;
}
