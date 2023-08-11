'use client';
import { Link } from '@chakra-ui/next-js';
import { Flex, Input, InputGroup, InputRightElement, Select, SimpleGrid, Spinner, Tag } from '@chakra-ui/react';
import { debounce, isNil } from 'lodash';
import Image from 'next/image';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import { ImageRecord, TagRecord } from '~/utils/xata';
import { BaseLayout } from '../layout/base';
import { ImageUpload } from './upload';

export type ImageRecordWithThumb = ImageRecord & {
  thumb: {
    url: string;
    attributes: {
      width: number;
      height: number;
    };
  };
};

export type TagWithCount = TagRecord & {
  totalImages: number;
};

export type Page = {
  pageNumber: number;
  hasNextPage: boolean;
  hasPrevousPage: boolean;
  totalNumberOfPages: number;
};

interface ImagesProps {
  images: ImageRecordWithThumb[];
  tags?: TagWithCount[];
  page: Page;
}

export const Images: FC<ImagesProps> = ({ images, tags, page }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [selectedPageNumber, setSelectedPageNumber] = useState(page.pageNumber);

  const router = useRouter();

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const debounceOnChange = debounce(handleSearchChange, 250);

  useEffect(() => {
    const fetchRecords = async () => {
      if (isNil(searchQuery) || searchQuery === '') {
        setSearchResults(null);
        return;
      }
      setIsLoadingSearch(true);
      const response = await fetch(`/api/search?q=${searchQuery}`);
      const results = await response.json();

      setSearchResults(results);
      setIsLoadingSearch(false);
    };

    void fetchRecords();
  }, [searchQuery]);

  const handlePageChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPageNumber(parseInt(event.target.value));
    router.push(`?p=${event.target.value}`);
  };

  console.log('searchResults', searchResults);

  return (
    <BaseLayout>
      <Flex alignItems="center" justifyContent="space-between" mb={8}>
        <InputGroup maxW={200}>
          <Input type="search" placeholder="Search" onChange={debounceOnChange} />
          {isLoadingSearch && (
            <InputRightElement>
              <Spinner size="sm" />
            </InputRightElement>
          )}
        </InputGroup>
        {/*
        <Heading as="h1" size="md">
          {title ? 'Images tagged with ' + title : 'All images'}
        </Heading>
        */}
        <ImageUpload />
      </Flex>
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
                {tag.totalImages}
              </Flex>
            </Tag>
          ))}
        </Flex>
      )}
      <SimpleGrid columns={4} spacing={2}>
        {images.map((image) => {
          return (
            <NextLink key={image.id} href={`/images/${image.id}`}>
              <Image
                src={image.thumb.url}
                width={image.thumb.attributes.width}
                height={image.thumb.attributes.height}
                alt={image.name}
              />
            </NextLink>
          );
        })}
      </SimpleGrid>
      {page.totalNumberOfPages > 1 && (
        <Flex justifyContent="center" mt={4}>
          <Flex gap={4} alignItems="center">
            {page.hasPrevousPage && <Link href={`?p=${page.pageNumber - 1}`}>Previous</Link>}
            <Select onChange={handlePageChange} value={selectedPageNumber}>
              {Array.from(Array(page.totalNumberOfPages).keys()).map((pageNumber) => (
                <option key={pageNumber} value={pageNumber + 1}>
                  {pageNumber + 1}
                </option>
              ))}
            </Select>

            {page.hasNextPage && <Link href={`?p=${page.pageNumber + 1}`}>Next</Link>}
          </Flex>
        </Flex>
      )}
    </BaseLayout>
  );
};
