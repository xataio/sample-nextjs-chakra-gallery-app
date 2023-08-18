import { compact } from 'lodash';
import { Images, TagWithImageCount } from '~/components/images';
import { IMAGES_PER_PAGE_COUNT, IMAGE_SIZE } from '~/utils/contants';
import { getXataClient } from '~/utils/xata';

const xata = getXataClient();

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

  const recordsWithTag = await xata.db['tag-to-image']
    .filter({
      'tag.id': id
    })
    // @ts-ignore-next-line TODO: Alexis to fix SDK types
    .select(['*', 'image.image.url', 'image.image.attributes', 'image.image.name'])
    .getPaginated({
      pagination: { size: IMAGES_PER_PAGE_COUNT, offset: IMAGES_PER_PAGE_COUNT * pageNumber - IMAGES_PER_PAGE_COUNT }
    });

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

      return { ...record.image.toSerializable(), thumb };
    })
  );

  const tagImageCount = await getTagImageCount(id);

  const tag = await xata.db.tag.read(id);
  const tagWithCount = {
    ...tag?.toSerializable(),
    imageCount: tagImageCount
  } as TagWithImageCount;

  const totalNumberOfPages = Math.ceil(tagImageCount / IMAGES_PER_PAGE_COUNT);

  const page = {
    pageNumber,
    hasNextPage: recordsWithTag.hasNextPage(),
    hasPreviousPage: pageNumber > 1,
    totalNumberOfPages: totalNumberOfPages
  };

  return <Images images={imageRecords} tags={[tagWithCount]} page={page} />;
}
