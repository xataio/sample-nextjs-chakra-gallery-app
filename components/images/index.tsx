'use client';
import { Link } from '@chakra-ui/next-js';
import { Flex, Select } from '@chakra-ui/react';
import { JSONData } from '@xata.io/client';
import { range } from 'lodash';
import { useRouter } from 'next/navigation';
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

export type Page = {
  pageNumber: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalNumberOfPages: number;
};

type ImagesProps = {
  page: Page;
  readOnly: boolean;
  images: ImageRecordWithThumb[];
};

export const Images: FC<ImagesProps> = ({ images, page, readOnly }) => {
  const currentPage = page.pageNumber;
  const router = useRouter();

  return (
    <BaseLayout>
      <Flex alignItems="start" justifyContent="space-between" mb={8}>
        <ImageUpload readOnly={readOnly} />
        <Search />
      </Flex>
      <Tags />
      <ImagesGrid images={images} />
      {/*
        Server side we created a page object that contains information about the current page,
        then find the current page from the router query.
      */}
      {page.totalNumberOfPages > 1 && (
        <Flex justifyContent="center" mt={8}>
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
