import { compact } from 'lodash';
import { Images, TagWithImageCount } from '~/components/images';
import { imageSize, imagesPerPageCount } from '~/utils/contants';
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
    pagination: { size: imagesPerPageCount, offset: imagesPerPageCount * pageNumber - imagesPerPageCount }
  });

  const imageCount = await getImageCount();
  const totalNumberOfPages = Math.ceil(imageCount / imagesPerPageCount);

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
    ]
  });

  const images = compact(
    imagesPage.records.map((record) => {
      if (!record.image) {
        return undefined;
      }
      const { url } = record.image.transform({
        width: imageSize,
        height: imageSize,
        format: 'auto',
        fit: 'cover',
        gravity: 'top'
      });
      if (!url) {
        return undefined;
      }
      const thumb = {
        url,
        attributes: { width: imageSize, height: imageSize }
      };

      return { ...record.toSerializable(), thumb };
    })
  );

  const tags = topTags.summaries.map((tagSummary) => ({
    ...tagSummary.tag?.toSerializable(),
    imageCount: tagSummary.imageCount
  })) as TagWithImageCount[];

  return <Images images={images} tags={tags} page={page} />;
}
