'use client';
import { Flex, Input, InputGroup, InputRightElement, SimpleGrid, Spinner, Tag } from '@chakra-ui/react';
import { debounce, isNil } from 'lodash';
import Image from 'next/image';
import Link from 'next/link';
import { ChangeEvent, FC, useEffect, useState } from 'react';
import { ImageRecord, TagRecord } from '~/utils/xata';
import { BaseLayout } from '../layout/base';
import { ImageUpload } from './upload';

type ImageRecordWithThumb = ImageRecord & {
  thumb: {
    url: string;
    attributes: {
      width: number;
      height: number;
    };
  };
};

interface ImagesProps {
  images: ImageRecordWithThumb[];
  tags?: TagRecord[];
  title?: string;
}

export const Images: FC<ImagesProps> = ({ images, tags }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

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
        <Flex mb={8} gap={2}>
          {tags.map((tag) => (
            <Tag as={Link} key={tag.id} href={`/tags/${tag.id}`}>
              {tag.name}
            </Tag>
          ))}
        </Flex>
      )}
      <SimpleGrid columns={4} spacing={2}>
        {images.map((image) => {
          return (
            <Link key={image.id} href={`/images/${image.id}`}>
              <Image
                src={image.thumb.url}
                width={image.thumb.attributes.width}
                height={image.thumb.attributes.height}
                alt={image.name}
              />
            </Link>
          );
        })}
      </SimpleGrid>
    </BaseLayout>
  );
};
