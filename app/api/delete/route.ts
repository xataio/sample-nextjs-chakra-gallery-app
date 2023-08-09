import { NextResponse } from 'next/server';
import { TagRecord, getXataClient } from '~/utils/xata';

const xata = getXataClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  console.log('id', id);

  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing id' });
  }

  const tagsFromImage = await xata.db['tag-to-image']
    .filter({
      'image.id': id
    })
    .select(['*', 'tag.*'])
    .getMany();

  const tags = tagsFromImage.map((tag) => tag.tag) as TagRecord[];
  const tagIds = tags.map((tag) => tag.id);

  await xata.db['tag-to-image'].delete(tagIds);
  await xata.db.image.delete(id);

  return NextResponse.json({ success: true });
}
