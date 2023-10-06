'use client';
import { Flex } from '@chakra-ui/react';
import { JSONData } from '@xata.io/client';
import { FC } from 'react';
import { ImageRecord } from '~/utils/xata';
import { BaseLayout } from '../layout/base';
import { Search } from '../search';
import { Tags } from '../tags';
import { ImagesGrid } from './grid';
import { ImageUpload } from './upload';

// Because we serialized our data with .toSerializabe() server side,
// we need to cast it back to the original type as JSON Data
// Xata provides JSONData<T> for this purpose
export type ImageRecordWithThumb = JSONData<ImageRecord> & {
  thumb: {
    url: string;
    attributes: {
      width: number;
      height: number;
    };
  };
};

type ImagesProps = {
  pageNumber: number;
  tagId?: string;
  readOnly: boolean;
};

export const Images: FC<ImagesProps> = ({ pageNumber, tagId, readOnly }) => {
  return (
    <BaseLayout>
      <Flex alignItems="start" justifyContent="space-between" mb={8}>
        <ImageUpload readOnly={readOnly} />
        <Search />
      </Flex>
      <Tags tagId={tagId} />
      <ImagesGrid tagId={tagId} pageNumber={pageNumber} />
    </BaseLayout>
  );
};
