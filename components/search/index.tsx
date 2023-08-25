import {
  Box,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  useDisclosure
} from '@chakra-ui/react';
import { debounce, isNil } from 'lodash';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { SearchResult } from '~/components/search/result';

// This component is used to search for images. The majority of this code is for the UI
// and not related to Xata. The only Xata related code is the fetchRecords function which
// is called when the user types in the search box. This function hits an API route
// which uses Xata to search for images.
export const Search: FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [focused, setFocused] = useState();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // This effect is used to scroll the focused result into view
  useEffect(() => {
    if (!focused || !resultsRef.current) return;

    // @ts-ignore-next-line
    const resultElement = resultsRef.current.querySelector('[data-id="' + focused.record.id + '"]');

    if (!resultElement) return;

    resultElement.scrollIntoView({ block: 'center' });
  }, [focused]);

  // This effect is used to fetch search results when the user types in the search box
  useEffect(() => {
    const fetchRecords = async () => {
      if (isNil(searchQuery) || searchQuery === '') {
        setSearchResults([]);
        return;
      }
      setIsLoadingSearch(true);
      // Check the API route to see how we use Xata to search for images
      const response = await fetch(`/api/images/search?query=${searchQuery}`);
      const results = await response.json();
      setFocused(results[0]);

      setSearchResults(results);
      setIsLoadingSearch(false);
    };

    void fetchRecords();
  }, [searchQuery]);

  const debounceOnChange = debounce(handleSearchChange, 250);

  // This effect is used to handle keyboard events while the search modal is open
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocused((prevFocused: any) => {
          const index = searchResults.indexOf(prevFocused);

          if (index === -1 || index === searchResults.length - 1) return prevFocused;

          return searchResults[index + 1];
        });
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocused((prevFocused: any) => {
          const index = searchResults.indexOf(prevFocused);

          if (index === -1 || index === 0) return prevFocused;

          return searchResults[index - 1];
        });
      }

      if (e.key === 'Enter' && focused) {
        e.preventDefault();
        // @ts-ignore-next-line
        const slug = `/${focused.table}s/${focused.record.id}`;
        void router.push(slug);
        setSearchQuery('');
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, searchResults, router, focused, isOpen]);

  // Clear the search results on close
  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <>
      <Button onClick={onOpen}>Search</Button>

      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay backdropFilter="blur(12px)" bg="blackAlpha.600" />
        <ModalContent
          outline="solid 12px"
          outlineColor="whiteAlpha.200"
          bg="black"
          boxShadow="3xl"
          w={{ base: '90vw', lg: '3xl' }}
          maxW={{ base: '100%', lg: 1200 }}
          mt={{ base: '5vh', lg: '15vh' }}
        >
          <ModalBody borderRadius={10} p={0} bg="bg">
            <InputGroup w="full" alignItems="center">
              <Input
                type="search"
                size="lg"
                variant="unstyled"
                bg="bg"
                color="text"
                _focus={{ outline: 'none' }}
                px={4}
                py={4}
                autoFocus
                placeholder="Search"
                _placeholder={{ color: 'textPlaceholder' }}
                onChange={debounceOnChange}
              />
              {isLoadingSearch && (
                <InputRightElement mt={4} mr={4}>
                  <Spinner size="sm" />
                </InputRightElement>
              )}
            </InputGroup>
            <Box
              w={{
                base: '100%'
              }}
              overflowY="auto"
              maxH="60vh"
              ref={resultsRef}
            >
              {searchResults.map((result) => (
                <SearchResult
                  key={result.record.id}
                  // @ts-ignore-next-line
                  isFocused={focused?.record.id === result.record.id}
                  onClick={handleClose}
                  result={result}
                />
              ))}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
