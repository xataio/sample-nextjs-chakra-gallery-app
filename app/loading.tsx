import { HeaderLoading } from '~/components/layout/loading';

export default function Loading() {
  const readOnly = process.env.READ_ONLY === 'true';

  // You can add any UI inside Loading, including a Skeleton.
  return <HeaderLoading readOnly={readOnly} />;
}
