import { NextResponse } from 'next/server';
import { getXataClient } from '~/utils/xata';

const xata = getXataClient();

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const name = formData.get('name');

  const fileName: string = file.name;
  const fileData = await file.arrayBuffer().then((buffer) => Buffer.from(buffer));
  const mimeType = file.type;

  const record = await xata.db.image.create({
    name: name as string,
    image: {
      name: fileName,
      mediaType: mimeType,
      base64Content: fileData.toString('base64')
    }
  });

  return NextResponse.json({ success: true, record });
}
