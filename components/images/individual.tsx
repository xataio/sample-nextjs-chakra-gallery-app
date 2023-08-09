'use client';
import { Box, Button, Flex, FormControl, FormLabel, Heading, Tag, Text } from '@chakra-ui/react';
import NextImage from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { ImageRecord, TagRecord } from '~/utils/xata';
import { BaseLayout } from '../layout/base';
import { ImageUpload } from './upload';

interface ImageProps {
  image: ImageRecord;
  tags: TagRecord[];
}

export const Image: FC<ImageProps> = ({ image, tags }) => {
  const handleDelete = async () => {
    console.log('deleteing', image.id);
    const response = await fetch(`/api/delete?id=${image.id}`);
    console.log('response', response);
    const results = response.json();
    console.log('results', results);
  };

  return (
    <BaseLayout>
      <Flex alignItems="center" justifyContent="space-between" mb={8} w="full">
        <Heading as="h1" size="md">
          {image.name}
        </Heading>
        <ImageUpload />
      </Flex>
      <Flex alignItems="center" flexGrow={1}>
        <Flex alignItems="center" justifyContent="center" flexDir="column" grow={1}>
          <NextImage
            src={image.image.url}
            width={image.image.attributes.width}
            height={image.image.attributes.height}
            alt={image.name}
          />
        </Flex>
        <Flex flexDir="column" gap={6} maxW={300} boxShadow="outline" p={8} borderRadius="md">
          <FormControl>
            <FormLabel>Image name</FormLabel>
            <Text fontSize="sm">{image.name}</Text>
          </FormControl>
          <FormControl>
            <FormLabel>Image URL</FormLabel>
            <Text fontSize="sm">{image.image.url}</Text>
          </FormControl>
          <FormControl>
            <FormLabel>Image width</FormLabel>
            <Text fontSize="sm">{image.image.attributes.width}</Text>
          </FormControl>
          <FormControl>
            <FormLabel>Image height</FormLabel>
            <Text fontSize="sm">{image.image.attributes.height}</Text>
          </FormControl>
          {tags.length > 0 && (
            <FormControl>
              <FormLabel>Tagged as</FormLabel>
              <Flex gap={2}>
                {tags?.map((tag) => (
                  <Tag as={Link} key={tag.id} href={`/tags/${tag.id}`}>
                    {tag.name}
                  </Tag>
                ))}
              </Flex>
            </FormControl>
          )}
          <Box>
            <Button colorScheme="red" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </Flex>
      </Flex>
    </BaseLayout>
  );
};
