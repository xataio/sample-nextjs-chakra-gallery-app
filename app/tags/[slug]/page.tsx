import { Images } from '~/components/images';
import { TagRecord, getXataClient } from '~/utils/xata';
const xata = getXataClient();

export async function generateStaticParams() {
  const tags: TagRecord[] = await xata.db.tag.getMany();
  return tags.map((tag) => ({
    slug: tag.id
  }));
}

export default async function Page({ params }: { params: { slug: string } }) {
  const recordsWithTag = await xata.db['tag-to-image']
    .filter({
      'tag.id': params.slug
    })
    .select(['*', 'image.image.url', 'image.image.attributes', 'image.image.name'])
    .getMany();

  const imageRecords = recordsWithTag.map((record) => {
    const { url: transformedUrl } = record.image?.image?.transform({
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

    return { ...record.image, thumb };
  });

  const tag = (await xata.db.tag.read(params.slug)) as TagRecord;

  console.log(imageRecords);

  return <Images images={imageRecords} title={tag.name} />;
}
