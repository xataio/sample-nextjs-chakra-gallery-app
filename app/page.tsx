import { Images } from '~/components/images';

// Using Xata's aggregate helper, we can get the total number of images

export default async function Page({ searchParams }: { searchParams: { page: string } }) {
  const pageNumber = parseInt(searchParams.page) || 1;
  const readOnly = process.env.READ_ONLY === 'true';

  return <Images pageNumber={pageNumber} readOnly={readOnly} />;
}
