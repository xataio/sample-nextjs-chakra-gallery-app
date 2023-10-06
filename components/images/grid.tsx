'use client';

import { Box, SimpleGrid, Text } from '@chakra-ui/react';
import Image from 'next/image';
import NextLink from 'next/link';
import { FC } from 'react';
import { ImageRecordWithThumb } from '.';

type ImagesGridProps = {
  images: ImageRecordWithThumb[];
};

export const ImagesGrid: FC<ImagesGridProps> = ({ images }) => {
  return (
    <>
      {images.length === 0 && <Text>No images yet added</Text>}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
        {/* This uses the thumbnails we created server side based off our images */}
        {images.map(({ id, name, thumb }) => {
          return (
            <Box borderRadius="md" overflow="hidden" key={id}>
              <NextLink href={`/images/${id}`}>
                <Image
                  src={thumb.url}
                  width={thumb.attributes.width}
                  height={thumb.attributes.height}
                  alt={name ?? 'unknown image'}
                />
              </NextLink>
            </Box>
          );
        })}
      </SimpleGrid>
    </>
  );
};
