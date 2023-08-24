'use client';
import { Link } from '@chakra-ui/next-js';
import { Flex, Heading, Select, SimpleGrid, Tag, Text } from '@chakra-ui/react';
import { JSONData } from '@xata.io/client';
import { range } from 'lodash';
import Image from 'next/image';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { ImageRecord, TagRecord } from '~/utils/xata';
import { BaseLayout } from '../layout/base';
import { Search } from '../search';
import { ImageUpload } from './upload';

export type ImageRecordWithThumb = JSONData<ImageRecord> & {
  thumb: {
    url: string;
    attributes: {
      width: number;
      height: number;
    };
  };
};

export type TagWithImageCount = JSONData<TagRecord> & {
  imageCount: number;
};

export type Page = {
  pageNumber: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalNumberOfPages: number;
};

type ImagesProps = {
  images: ImageRecordWithThumb[];
  tags: TagWithImageCount[];
  page: Page;
};

export const Images: FC<ImagesProps> = ({ images, tags, page }) => {
  const currentPage = page.pageNumber;
  const router = useRouter();

  const renderTags = (tags: TagWithImageCount[]) => {
    if (tags.length === 0) {
      return null;
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

  return (
    <BaseLayout>
      <Flex alignItems="center" justifyContent="space-between" mb={8}>
        <ImageUpload />
        <Search />
      </Flex>
      {renderTags(tags)}
      {images.length === 0 && <Text>No images yet added</Text>}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={2}>
        {images.map(({ id, name, thumb }) => {
          return (
            <NextLink key={id} href={`/images/${id}`}>
              <Image
                src={thumb.url}
                width={thumb.attributes.width}
                height={thumb.attributes.height}
                alt={name ?? 'unknown image'}
              />
            </NextLink>
          );
        })}
      </SimpleGrid>
      {page.totalNumberOfPages > 1 && (
        <Flex justifyContent="center" mt={4}>
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
    </BaseLayout>
  );
};
