import { Images } from '~/components/images';
import { getXataClient, ImageRecord } from '~/utils/xata';

export default async function Page() {
  const xata = getXataClient();

  const records: ImageRecord[] = await xata.db.image
    .select(['name', 'image.base64Content', 'image.name', 'image.url', 'image.attributes'])
    .getMany();

  const transformedRecords = records.map((record) => {
    const { url: transformedUrl } = record.image?.transform({
      width: 294,
      height: 294,
      format: 'auto',
      fit: 'cover',
      gravity: 'top'
    });

    const thumb = {
      url: transformedUrl,
      attributes: { width: 294, height: 294 }
    };

    return { ...record, thumb };
  });

  const tags = await xata.db.tag.sort('name').getMany();

  return <Images images={transformedRecords} tags={tags} />;
}
