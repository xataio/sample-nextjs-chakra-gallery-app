import { JSONData } from '@xata.io/client';
import { compact } from 'lodash';
import { notFound } from 'next/navigation';
import { Image } from '~/components/images/individual';
import { ImageRecord, TagRecord, getXataClient } from '~/utils/xata';

const xata = getXataClient();

const getImage = async (id: string) => {
  const image = (await xata.db.image.read(id)) as ImageRecord;
  if (!image?.image) {
    return undefined;
  }
  return image.toSerializable();
};

export default async function Page({ params: { id } }: { params: { id: string } }) {
  const image = await getImage(id);
  if (!image) {
    notFound();
  }
  const tagsFromImage = await xata.db['tag-to-image']
    .filter({
      'image.id': id
    })
    .select(['*', 'tag.*'])
    .getMany();

  const tags = compact(tagsFromImage.map((tag) => tag.tag?.toSerializable())) as JSONData<TagRecord>[];

  const readOnly = process.env.READ_ONLY === 'true';

  return <Image image={image} tags={tags} readOnly={readOnly} />;
}
