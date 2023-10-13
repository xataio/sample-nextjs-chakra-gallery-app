'use client';
import { Button, Flex } from '@chakra-ui/react';
import { ImageUpload } from '~/components/images/upload';

export default function Loading() {
  const readOnly = process.env.READ_ONLY === 'true';

  // You can add any UI inside Loading, including a Skeleton.
  return (
    <>
      <Flex alignItems="start" justifyContent="space-between" mb={8}>
        <ImageUpload readOnly={readOnly} />
        <Button>Search</Button>
      </Flex>
    </>
  );
}
