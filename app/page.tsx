import { compact, pick } from 'lodash';
import { Images, TagWithImageCount } from '~/components/images';
import { IMAGES_PER_PAGE_COUNT, IMAGE_SIZE } from '~/utils/constants';
import { getXataClient } from '~/utils/xata';

const xata = getXataClient();

const getImageCount = async () => {
  const totalNumberOfImages = await xata.db.image.aggregate({
    totalCount: { count: '*' }
  });
  return totalNumberOfImages.aggs.totalCount;
};

export default async function Page({ searchParams }: { searchParams: { page: string } }) {
  const pageNumber = parseInt(searchParams.page) || 1;

  const imagesPage = await xata.db.image.sort('xata.createdAt', 'desc').getPaginated({
    pagination: { size: IMAGES_PER_PAGE_COUNT, offset: IMAGES_PER_PAGE_COUNT * pageNumber - IMAGES_PER_PAGE_COUNT }
  });

  const imageCount = await getImageCount();
  const totalNumberOfPages = Math.ceil(imageCount / IMAGES_PER_PAGE_COUNT);

  const page = {
    pageNumber,
    hasNextPage: imagesPage.hasNextPage(),
    hasPreviousPage: pageNumber > 1,
    totalNumberOfPages
  };

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

  const images = compact(
    imagesPage.records.map((record) => {
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
      if (!url) {
        return undefined;
      }
      const thumb = {
        url,
        attributes: { width: IMAGE_SIZE, height: IMAGE_SIZE }
      };

      return { ...record.toSerializable(), thumb };
    })
  );

  const tags = topTags.summaries.map((tagSummary) => {
    const tag = tagSummary.tag;
    const serializableTag = pick(tag, ['id', 'name', 'slug']);
    return {
      ...serializableTag,
      imageCount: tagSummary.imageCount
    };
  }) as TagWithImageCount[];

  return <Images images={images} tags={tags} page={page} />;
}
