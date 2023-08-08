'use client';
import { Flex, Heading, SimpleGrid, Tag } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
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

export const Images: FC<ImagesProps> = ({ images, tags, title }) => {
  return (
    <BaseLayout>
      <Flex alignItems="center" justifyContent="space-between" mb={8}>
        <Heading as="h1" size="md">
          {title ? 'Images tagged with ' + title : 'All images'}
        </Heading>
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
            <Link key={image.name} href={`/images/${image.id}`}>
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
