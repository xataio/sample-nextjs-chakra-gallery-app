'use client';
import { Button, Flex, FormControl, FormLabel, Heading, Tag, Text } from '@chakra-ui/react';
import NextImage from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { ImageRecord, TagRecord } from '~/utils/xata';
import { BaseLayout } from '../layout/base';

interface ImageProps {
  image: ImageRecord;
  tags?: TagRecord[];
}

export const Image: FC<ImageProps> = ({ image, tags }) => {
  return (
    <BaseLayout>
      <Flex alignItems="center" justifyContent="space-between" mb={8}>
        <Heading as="h1" size="md">
          {image.name}
        </Heading>
        <Button colorScheme="blue" size="sm">
          Add image
        </Button>
      </Flex>
      <Flex alignItems="center" justifyContent="space-around" flexGrow={1}>
        <NextImage
          src={image.image.url}
          width={image.image.attributes.width}
          height={image.image.attributes.height}
          alt={image.name}
          flexGrow={1}
        />
        <Flex flexDir="column" gap={6} maxW={300}>
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
        </Flex>
      </Flex>
    </BaseLayout>
  );
};
