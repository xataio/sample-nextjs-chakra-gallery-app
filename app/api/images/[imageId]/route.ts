import { NextResponse } from 'next/server';
import { getXataClient } from '~/utils/xata';

const xata = getXataClient();

// Next.js edge runtime
// https://nextjs.org/docs/pages/api-reference/edge
export const runtime = 'edge';
export const preferredRegion = 'iad1';

// A delete function to handle requests to delete an image
export async function DELETE(request: Request, { params }: { params: { imageId: string } }) {
  const { imageId } = params;
  if (!imageId) {
    return NextResponse.json(
      { message: 'imageId not found' },
      {
        status: 404
      }
    );
  }

  const linksFromImage = await xata.db['tag-to-image']
    .filter({
      'image.id': imageId
    })
    .getAll();

  // Delete all tag links to this image first
  await xata.db['tag-to-image'].delete(linksFromImage.map((link) => link.id));
  // Delete the image
  await xata.db.image.delete(imageId);

  return NextResponse.json({ success: true });
}
