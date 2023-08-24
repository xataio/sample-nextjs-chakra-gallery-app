'use client';
import { Link } from '@chakra-ui/next-js';
import { Box, Button, Flex, FormControl, FormLabel, Heading, Tag, Text, useToast } from '@chakra-ui/react';
import { JSONData, transformImage } from '@xata.io/client';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { ImageRecord, TagRecord } from '~/utils/xata';
import { BaseLayout } from '../layout/base';
import { Search } from '../search';
import { ImageUpload } from './upload';

interface ImageProps {
  image: JSONData<ImageRecord>;
  tags: JSONData<TagRecord>[];
}

export const Image: FC<ImageProps> = ({ image, tags }) => {
  const router = useRouter();
  const toast = useToast();
  const handleDelete = async () => {
    const response = await fetch(`/api/images/${image.id}`, { method: 'DELETE' });
    if (response.status === 200) {
      router.refresh();
      router.push('/');
      toast({
        title: 'Image deleted',
        description: `Image ${image.name} has been deleted`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    }
  };

  // @ts-ignore-next-line TODO: Alexis will fix types
  const clientSideThumbnailUrl = transformImage(image.image.url, [
    { width: 300, height: 50, fit: 'cover', gravity: 'center', blur: 100 }
  ]) as string;

  return (
    <BaseLayout>
      <Flex alignItems="center" justifyContent="space-between" mb={8} w="full">
        <ImageUpload />
        <Search />
      </Flex>
      <Heading as="h1" size="md" mb={8}>
        {image.name}
      </Heading>
      <Flex mb={8} gap={2} wrap="wrap">
        <Link href="/">&laquo; Back to all images</Link>
      </Flex>
      <Flex alignItems="start" flexGrow={1} gap={8} flexDir={{ base: 'column', lg: 'row' }}>
        <Flex alignItems="center" justifyContent="center" flexDir="column" grow={1} w="full">
          <NextImage
            // @ts-ignore-next-line TODO: Alexis will fix types
            src={image.image.url}
            // @ts-ignore-next-line
            width={image.image.attributes.width}
            // @ts-ignore-next-line
            height={image.image.attributes.height}
            // @ts-ignore-next-line
            alt={image.name}
            style={{ maxWidth: '80%' }}
          />
        </Flex>
        <Flex
          flexDir="column"
          gap={6}
          maxW={{ base: 'full', lg: 300 }}
          bg="contrastLowest"
          p={8}
          borderRadius="md"
          w="full"
        >
          <FormControl>
            <FormLabel>Client side thumbnail transform</FormLabel>
            <NextImage src={clientSideThumbnailUrl} alt={image.name || ''} width={300} height={50} />
          </FormControl>
          <FormControl>
            <FormLabel>Image name</FormLabel>
            <Text fontSize="sm">{image.name}</Text>
          </FormControl>
          <FormControl>
            <FormLabel>Original image URL</FormLabel>
            {/* @ts-ignore-next-line TODO: Alexis will fix types */}
            <Link href={image.image.url} fontSize="xs">
              {/* @ts-ignore-next-line TODO: Alexis will fix types */}
              {image.image.url}
            </Link>
          </FormControl>
          <FormControl>
            <FormLabel>Original width</FormLabel>
            {/* @ts-ignore-next-line TODO: Alexis will fix types */}
            <Text fontSize="sm">{image.image.attributes.width}</Text>
          </FormControl>
          <FormControl>
            <FormLabel>Original height</FormLabel>
            {/* @ts-ignore-next-line TODO: Alexis will fix types */}
            <Text fontSize="sm">{image.image.attributes.height}</Text>
          </FormControl>
          {tags.length > 0 && (
            <FormControl>
              <FormLabel>Tagged as</FormLabel>
              <Flex gap={2}>
                {tags?.map((tag) => (
                  <Tag as={NextLink} key={tag.id} href={`/tags/${tag.id}`}>
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
