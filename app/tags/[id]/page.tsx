import { Images } from '~/components/images';

export default async function Page({
  params: { id },
  searchParams
}: {
  params: { id: string };
  searchParams: { page: string };
}) {
  const pageNumber = parseInt(searchParams.page) || 1;

  const readOnly = process.env.READ_ONLY === 'true';

  return <Images tagId={id} pageNumber={pageNumber} readOnly={readOnly} />;
}
