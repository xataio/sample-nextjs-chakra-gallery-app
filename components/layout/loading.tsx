'use client';
import { Button, Flex } from '@chakra-ui/react';
import { FC } from 'react';
import { ImageUpload } from '../images/upload';

interface LoadingProps {
  readOnly: boolean;
}

export const HeaderLoading: FC<LoadingProps> = ({ readOnly }) => {
  return (
    <Flex alignItems="start" justifyContent="space-between" mb={8}>
      <ImageUpload readOnly={readOnly} />
      <Button>Search</Button>
    </Flex>
  );
};
