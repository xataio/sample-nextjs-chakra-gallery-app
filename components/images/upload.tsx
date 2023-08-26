'use client';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { FC, FormEvent, useState } from 'react';
import { GitHubIcon } from '../icons/github';

interface ImageUploadProps {
  readOnly: boolean;
}

export const ImageUpload: FC<ImageUploadProps> = ({ readOnly }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file || !name || !tags) {
      setMessage('Name, file and tags are required.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('tags', tags);

    try {
      // This route creates new image and tag records in Xata
      const response = await fetch('/api/images', {
        method: 'POST',
        body: formData
      });

      const image = await response.json();

      if (response.status === 200) {
        toast({
          title: 'Image uploaded.',
          description: 'Your image was uploaded successfully.',
          status: 'success',
          duration: 5000,
          isClosable: true
        });
        router.push(`/images/${image.id}`);
      } else {
        throw new Error("Couldn't upload image");
      }
    } catch (error) {
      setMessage('An error occurred while uploading the image.');
    }
  };

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  if (readOnly) {
    return (
      <Box>
        <Button
          as="a"
          href="https://github.com/xataio/sample-nextjs-chakra-gallery-app"
          colorScheme="primary"
          leftIcon={<GitHubIcon boxSize={5} />}
        >
          Source on GitHub
        </Button>
        <Text mt={4} fontSize="xs" color="textSubtle">
          This demo set to read only mode.{' '}
          <Link href="https://github.com/xataio/sample-nextjs-chakra-gallery-app/">Run it locally</Link> to explore the
          full functionality.
        </Text>
      </Box>
    );
  }

  return (
    <>
      <Button colorScheme="primary" onClick={onOpen}>
        Add image
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(12px)" bg="blackAlpha.600" />
        <ModalContent boxShadow="outline">
          <form onSubmit={handleSubmit}>
            <ModalHeader>Add an image</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Flex flexDir="column" gap={4}>
                <FormControl id="name" isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
                </FormControl>
                <FormControl id="name" isRequired>
                  <FormLabel>Tags</FormLabel>
                  <Input type="text" name="name" value={tags} onChange={(e) => setTags(e.target.value)} />
                </FormControl>
                <FormControl id="file" isRequired>
                  <FormLabel>Image</FormLabel>
                  <Input type="file" name="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
                </FormControl>
              </Flex>
              {message && <div>{message}</div>}
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" colorScheme="primary">
                Upload
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
