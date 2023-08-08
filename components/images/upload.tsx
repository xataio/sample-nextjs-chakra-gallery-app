'use client';
import {
  Button,
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
  useDisclosure
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const ImageUpload = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !name) {
      setMessage('Name and file are required.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    try {
      const response = await fetch('/images/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      console.log(result);

      if (result.success) {
        setMessage('Image uploaded successfully.');
        router.push(`/images/${result.record.id}`);
      } else {
        setMessage('Error uploading image.');
      }
    } catch (error) {
      setMessage('An error occurred while uploading the image.');
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <>
      <Button colorScheme="primary" onClick={onOpen}>
        Add image
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>Modal Title</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl id="name" isRequired>
                <FormLabel>Name</FormLabel>
                <Input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
              </FormControl>
              <FormControl id="file" isRequired>
                <FormLabel>Image</FormLabel>
                <Input type="file" name="file" onChange={handleFileChange} />
              </FormControl>
              {message && <div>{message}</div>}
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Upload</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
