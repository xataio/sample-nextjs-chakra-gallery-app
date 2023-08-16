import { compact } from 'lodash';
import { Images, TagWithImageCount } from '~/components/images';
import { getXataClient } from '~/utils/xata';

const imagesPerPageCount = 8;
const xata = getXataClient();

const getImageCount = async () => {
  const totalNumberOfImages = await xata.db.image.aggregate({
    totalCount: { count: '*' }
  });
  return totalNumberOfImages.aggs.totalCount;
};

export default async function Page({ searchParams }: { searchParams: { page: string } }) {
  const pageNumber = parseInt(searchParams.page, 10) ?? 1;

  const paginatedRecords = await xata.db.image.sort('xata.createdAt', 'desc').getPaginated({
    pagination: { size: imagesPerPageCount, offset: imagesPerPageCount * pageNumber - imagesPerPageCount }
  });

  const imageCount = await getImageCount();
  const totalNumberOfPages = Math.ceil(imageCount / imagesPerPageCount);

  const page = {
    pageNumber,
    hasNextPage: paginatedRecords.hasNextPage(),
    hasPrevousPage: pageNumber > 1,
    totalNumberOfPages
  };

  const topTags = await xata.db['tag-to-image'].summarize({
    columns: ['tag'],
    summaries: {
      totalImages: { count: '*' }
    },
    sort: [
      {
        totalImages: 'desc'
      }
    ]
  });

  const images = compact(
    paginatedRecords.records.map((record) => {
      if (!record.image) {
        return undefined;
      }
      const { url } = record.image.transform({
        width: 294,
        height: 294,
        format: 'auto',
        fit: 'cover',
        gravity: 'top'
      });
      if (!url) {
        return undefined;
      }
      const thumb = {
        url,
        attributes: { width: 294, height: 294 }
      };

      return { ...record, thumb };
    })
  );

  const tags = topTags.summaries.map((tagSummary) => ({
    ...tagSummary.tag,
    imageCount: tagSummary.totalImages
  })) as TagWithImageCount[];

  return <Images images={images} tags={tags} page={page} />;
}
