import { compact } from 'lodash';
import { NextResponse } from 'next/server';
import slugify from 'slugify';
import { v4 as uuid } from 'uuid';
import { IMAGES_PER_PAGE_COUNT, IMAGE_SIZE } from '~/utils/constants';
import { ImageRecord, getXataClient } from '~/utils/xata';

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

const getImageCount = async () => {
  const totalNumberOfImages = await xata.db.image.summarize({
    columns: [],
    summaries: {
      count: { count: '*' }
    }
  });
  return totalNumberOfImages.summaries[0].count;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageNumber = parseInt(searchParams.get('page') || '1') ?? 1;

  const imageCountPromise = getImageCount();

  const imagesPagePromise = xata.db.image.sort('xata.createdAt', 'desc').getPaginated({
    pagination: { size: IMAGES_PER_PAGE_COUNT, offset: IMAGES_PER_PAGE_COUNT * pageNumber - IMAGES_PER_PAGE_COUNT }
  });

  console.time('Fetching images and count');
  const [imageCount, imagesPage] = await Promise.all([imageCountPromise, imagesPagePromise]);
  console.timeEnd('Fetching images and count');

  const totalNumberOfPages = Math.ceil(imageCount / IMAGES_PER_PAGE_COUNT);

  // This page object is needed for building the buttons in the pagination component
  const page = {
    pageNumber,
    hasNextPage: imagesPage.hasNextPage(),
    hasPreviousPage: pageNumber > 1,
    totalNumberOfPages
  };

  // We use Xata's transform helper to create a thumbnail for each image
  // and apply it to the image object
  const images = compact(
    await Promise.all(
      imagesPage.records.map(async (record: ImageRecord) => {
        if (!record.image) {
          return undefined;
        }

        const { url } = record.image.transform({
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          format: 'auto',
          fit: 'cover',
          gravity: 'top'
        });

        // Since the resulting image will be a square, we don't really need to fetch the metadata
        // but let's do it anyway to show how it's done. Meta data provides both the original
        // and transformed dimensions of the image.
        // const metadata = await fetchMetadata(metadataUrl);

        if (!url) {
          return undefined;
        }

        const thumb = {
          url,
          attributes: {
            width: IMAGE_SIZE, // Post transform width
            height: IMAGE_SIZE // Post transform height
          }
        };

        return { ...record.toSerializable(), thumb };
      })
    )
  );

  // Return the results as JSON
  return new Response(JSON.stringify({ images, page }), {
    headers: { 'Cache-Control': 'max-age=1, stale-while-revalidate=300' }
  });
}
