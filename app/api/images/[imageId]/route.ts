import { NextResponse } from 'next/server';
import { getXataClient } from '~/utils/xata';

const xata = getXataClient();

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

  await xata.db['tag-to-image'].delete(linksFromImage.map((link) => link.id));
  await xata.db.image.delete(imageId);

  return NextResponse.json({ success: true });
}
