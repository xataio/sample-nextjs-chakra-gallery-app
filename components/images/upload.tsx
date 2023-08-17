'use client';
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export const ImageUpload = () => {
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
                  <Input type="file" name="file" onChange={handleFileChange} />
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
