'use client';

import { Link } from '@chakra-ui/next-js';
import { Box, Flex, Select, SimpleGrid, Skeleton, Text } from '@chakra-ui/react';
import { range } from 'lodash';
import Image from 'next/image';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import useSWR from 'swr';
import { IMAGE_SIZE } from '~/utils/constants';
import { fetcher } from '~/utils/fetcher';
import { ImageRecordWithThumb } from '.';

type ImagesGridProps = {
  pageNumber: number;
  tagId?: string;
};

export type Page = {
  pageNumber: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalNumberOfPages: number;
};

type ImagesResponse = {
  images: ImageRecordWithThumb[];
  page: Page;
};

function useImages(pageNumber: number, tagId?: string) {
  let url = `/api/images?page=${pageNumber}`;
  if (tagId) {
    url = `/api/images/tag/${tagId}?page=${pageNumber}`;
  }
  const { data, error, isLoading } = useSWR(url, fetcher);
  return {
    data: data as ImagesResponse,
    isLoading,
    error
  };
}

export const ImagesGrid: FC<ImagesGridProps> = ({ pageNumber, tagId }) => {
  const router = useRouter();
  const currentPage = pageNumber;
  const { data, error, isLoading } = useImages(pageNumber, tagId);
  const images = data?.images;
  const page = data?.page;

  if (error) {
    return null;
  }

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
        <Skeleton width={IMAGE_SIZE} height={IMAGE_SIZE} />
        <Skeleton width={IMAGE_SIZE} height={IMAGE_SIZE} />
        <Skeleton width={IMAGE_SIZE} height={IMAGE_SIZE} />
        <Skeleton width={IMAGE_SIZE} height={IMAGE_SIZE} />
      </SimpleGrid>
    );
  }

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
      {/*
        Server side we created a page object that contains information about the current page,
        then find the current page from the router query.
      */}
      {page.totalNumberOfPages > 1 && (
        <Flex justifyContent="center" mt={8}>
          <Flex gap={4} alignItems="center">
            {page.hasPreviousPage && <Link href={`?page=${currentPage - 1}`}>Previous</Link>}
            <Select onChange={(event) => router.push(`?page=${event.target.value}`)} value={currentPage}>
              {range(1, page.totalNumberOfPages + 1).map((pageNumber) => (
                <option key={pageNumber} value={pageNumber}>
                  {pageNumber}
                </option>
              ))}
            </Select>

            {page.hasNextPage && <Link href={`?page=${currentPage + 1}`}>Next</Link>}
          </Flex>
        </Flex>
      )}
    </>
  );
};
