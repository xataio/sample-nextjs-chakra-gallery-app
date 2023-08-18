import { NextResponse } from 'next/server';
import slugify from 'slugify';
import { v4 as uuid } from 'uuid';
import { getXataClient } from '~/utils/xata';

const xata = getXataClient();

export const runtime = 'edge';
export const preferredRegion = 'iad1';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const name = formData.get('name');
  const tags = formData.get('tags');

  const tagsArray = tags ? (tags as string).split(',').map((tag) => tag.trim()) : [];

  const fileName: string = file.name;
  const fileData = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type;

  const record = await xata.db.image.create({
    name: name as string,
    image: {
      name: fileName,
      mediaType: mimeType,
      base64Content: fileData.toString('base64')
    }
  });

  await xata.db.tag.createOrUpdate([
    ...tagsArray.map((tag) => ({
      id: slugify(tag, { lower: true }),
      name: tag
    }))
  ]);

  if (tagsArray.length > 0 && record.id) {
    await xata.db['tag-to-image'].create(
      // Create an array of objects with the tag id and image id
      tagsArray.map((tag) => ({
        id: uuid(),
        tag: slugify(tag, { lower: true }),
        image: record.id
      }))
    );
  }

  return NextResponse.json(record);
}