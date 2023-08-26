import { NextResponse } from 'next/server';
import slugify from 'slugify';
import { v4 as uuid } from 'uuid';
import { getXataClient } from '~/utils/xata';

const xata = getXataClient();

// Next.js edge runtime
// https://nextjs.org/docs/pages/api-reference/edge
export const runtime = 'edge';
export const preferredRegion = 'iad1';

export async function POST(request: Request) {
  // People on the internet can be mean, so let's make sure we don't allow
  // anyone to create images in the live demo
  if (process.env.READ_ONLY === 'true') {
    return NextResponse.json(
      { message: 'Read only mode enabled' },
      {
        status: 403
      }
    );
  }

  // Get the form data
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const name = formData.get('name');
  const tags = formData.get('tags');

  // Split the tags into an array from a comma separated string
  const tagsArray = tags ? (tags as string).split(',').map((tag) => tag.trim()) : [];

  const fileName: string = file.name;
  const fileData = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type;

  // Create the image record in Xata
  const record = await xata.db.image.create({
    name: name as string,
    image: {
      name: fileName,
      mediaType: mimeType,
      // Xata expects a base64 encoded string for the file content
      base64Content: fileData.toString('base64')
    }
  });

  // Once the image is created, create or update any related tags
  await xata.db.tag.createOrUpdate([
    ...tagsArray.map((tag) => ({
      id: slugify(tag, { lower: true }),
      name: tag
    }))
  ]);

  // Once the tags are created, create the links between the image and the tags
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

  // Xata provides a toSerializable() method to convert the record to a plain JSON object
  // This is needed for Next.js on the client side
  return NextResponse.json(record.toSerializable());
}
