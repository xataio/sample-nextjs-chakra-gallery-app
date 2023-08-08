import { Image } from '~/components/images/individual';
import { ImageRecord, TagRecord, getXataClient } from '~/utils/xata';
const xata = getXataClient();

export async function generateStaticParams() {
  const images: ImageRecord[] = await xata.db.image.getMany();
  return images.map((image) => ({
    slug: image.id
  }));
}

export default async function Page({ params }: { params: { slug: string } }) {
  const image = (await xata.db.image.read(params.slug, [
    'name',
    'image.base64Content',
    'image.name',
    'image.url',
    'image.attributes'
  ])) as ImageRecord;

  const tagsFromImage = await xata.db['tag-to-image']
    .filter({
      'image.id': params.slug
    })
    .select(['*', 'tag.*'])
    .getMany();

  const tags = tagsFromImage.map((tag) => tag.tag) as TagRecord[];

  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image image={image} tags={tags} />;
}
