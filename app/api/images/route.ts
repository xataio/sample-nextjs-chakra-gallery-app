import { NextResponse } from 'next/server';
import slugify from 'slugify';
import { v4 as uuid } from 'uuid';
import { getXataClient } from '~/utils/xata';

const xata = getXataClient();

export async function POST(request: Request) {
  // People on the internet can be mean, so let's make sure we don't allow
  // anyone to create images in the live demo
  if (process.env.READ_ONLY === 'true') {
    return NextResponse.json({ message: 'Read only mode enabled' }, { status: 403 });
  }

  // Get the form data
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const fileBlob = new Blob([file], { type: file.type });
  const name = formData.get('name') as string;
  const tags = formData.get('tags') as string;

  // Split the tags into an array from a comma separated string
  const tagsArray =
    tags?.split(',').map((tag) => {
      const name = tag.trim();
      return { id: slugify(name, { lower: true }), name };
    }) ?? [];

  // Create the image record in Xata
  const record = await xata.db.image.create({ name }, ['*', 'image.uploadUrl']);

  // Upload the file and attach it to the image record
  //  await xata.files.upload({ table: 'image', column: 'image', record: record.id }, file);
  await fetch(record.image?.uploadUrl ?? '', { method: 'PUT', body: fileBlob });
  await xata.db.image.update(record.id, { image: { name: file.name } });

  // Once the image is created, create or update any related tags
  // Also create the links between the image and the tags
  if (tagsArray.length > 0) {
    await xata.db.tag.createOrUpdate(tagsArray);

    await xata.db['tag-to-image'].create(
      // Create an array of objects with the tag id and image id
      tagsArray.map(({ id: tag }) => ({ id: uuid(), tag, image: record.id }))
    );
  }

  // Xata provides a toSerializable() method to convert the record to a plain JSON object
  // This is needed for Next.js on the client side
  return NextResponse.json(record.toSerializable());
}
