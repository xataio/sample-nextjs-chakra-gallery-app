'use client';

import { Link } from '@chakra-ui/next-js';
import { Flex, Heading, Skeleton, Tag } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FC } from 'react';
import useSWR from 'swr';
import { TagWithImageCount } from '~/app/api/tags/route';

const fetcher = async (...args: [RequestInfo, RequestInit?]) => {
  const res = await fetch(...args);
  return res.json();
};

function useTags() {
  const { data, error, isLoading } = useSWR('/api/tags', fetcher);
  return {
    tags: data as TagWithImageCount[],
    isLoading,
    error
  };
}

export const Tags: FC = () => {
  const { tags, error, isLoading } = useTags();

  if (error) {
    return null;
  }

  // We render the tags in a different way depending on how many there are

  if (isLoading || tags.length > 1) {
    return (
      <>
        <Skeleton isLoaded={!isLoading}>
          <Heading as="h1" size="md" mb={8}>
            All images
          </Heading>
          {tags && (
            <Flex mb={8} gap={2} wrap="wrap">
              {tags.map((tag) => (
                <Tag as={NextLink} key={tag.id} href={`/tags/${tag.id}`} gap={2}>
                  {tag.name}
                  <Flex
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xs"
                    bg="contrastLowest"
                    boxSize={4}
                    borderRadius="md"
                    color="contrastMedium"
                  >
                    {tag.imageCount}
                  </Flex>
                </Tag>
              ))}
            </Flex>
          )}
        </Skeleton>
      </>
    );
  }

  if (tags.length === 0) {
    return null;
  }

  return (
    <>
      <Heading as="h1" size="md" mb={8}>
        {tags[0].imageCount} images tagged with <Tag>{tags[0].name}</Tag>
      </Heading>
      <Flex mb={8} gap={2} wrap="wrap">
        <Link href="/">&laquo; Back to all images</Link>
      </Flex>
    </>
  );
};
