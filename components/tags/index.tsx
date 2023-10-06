'use client';

import { Link } from '@chakra-ui/next-js';
import { Flex, Heading, Skeleton, Tag } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FC } from 'react';
import useSWR from 'swr';
import { TagWithImageCount } from '~/app/api/tags/route';
import { fetcher } from '~/utils/fetcher';

function useTags(tagId?: string) {
  let url = '/api/tags';
  if (tagId) {
    url += `/?tagId=${tagId}`;
  }
  const { data, error, isLoading } = useSWR(url, fetcher);
  return {
    tags: data as TagWithImageCount[],
    isLoading,
    error
  };
}

type TagsProps = {
  tagId?: string;
};

export const Tags: FC<TagsProps> = ({ tagId }) => {
  const { tags, error, isLoading } = useTags(tagId);

  if (error) {
    return null;
  }

  // We render the tags in a different way depending on how many there are

  if (isLoading) {
    return <Skeleton mb={8} height={20}></Skeleton>;
  }

  if (tags.length > 1) {
    return (
      <>
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
