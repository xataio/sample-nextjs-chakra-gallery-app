import { notFound } from 'next/navigation';
import { Image } from '~/components/images/individual';
import { imageSize } from '~/utils/contants';
import { ImageRecord, TagRecord, getXataClient } from '~/utils/xata';

const xata = getXataClient();

const getImage = async (slug: string) => {
  const image = (await xata.db.image.read(slug)) as ImageRecord;
  if (!image?.image) {
    return undefined;
  }
  const { url } = image.image.transform({
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
  // @ts-ignore todo: richard fix
  image.image.thumb = thumb;
  return image;
};

export default async function Page({ params: { slug } }: { params: { slug: string } }) {
  const image = await getImage(slug);
  if (!image) {
    notFound();
  }
  const tagsFromImage = await xata.db['tag-to-image']
    .filter({
      'image.id': slug
    })
    .select(['*', 'tag.*'])
    .getMany();

  const tags = tagsFromImage.map((tag) => tag.tag) as TagRecord[];

  return <Image image={image} tags={tags} />;
}
