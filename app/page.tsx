import { Images } from '~/components/images';

// Next.js edge runtime
// https://nextjs.org/docs/pages/api-reference/edge
export const runtime = 'edge';

export default async function Page({ searchParams }: { searchParams: { page: string } }) {
  const pageNumber = parseInt(searchParams.page) || 1;
  const readOnly = process.env.READ_ONLY === 'true';

  return <Images pageNumber={pageNumber} readOnly={readOnly} />;
}
