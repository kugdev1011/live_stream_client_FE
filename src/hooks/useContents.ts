import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchVideosList } from '@/services/stream';
import { StreamsResponse, VideosListRequest } from '@/data/dto/stream';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/data/validations';

const useContents = (payload: VideosListRequest = {}) => {
  const {
    page = DEFAULT_PAGE,
    limit = DEFAULT_PAGE_SIZE,
    status,
    categoryId1 = 0,
    categoryId2 = 0,
    categoryId3 = 0,
    title = '',
    isMe = false,
  } = payload;

  const [contents, setContents] = useState<StreamsResponse[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);

  // Ref to store previous dependencies
  const prevDepsRef = useRef({
    status,
    categoryId1,
    categoryId2,
    categoryId3,
    title,
  });

  const refetchContents = () => {
    setRefetchKey((prevKey) => prevKey + 1);
  };

  const fetchNextPage = () => {
    if (!isLoading && contents.length < totalItems) {
      setCurrentPage((prev) => prev + 1);
      fetchContentsData(currentPage + 1, true);
    }
  };

  const fetchContentsData = useCallback(
    async (page: number, isScrollFetch: boolean) => {
      try {
        setIsLoading(true);
        setError(null);

        const params: Record<string, unknown> = {
          page,
          limit,
          status,
          title,
          isMe,
          categoryId1: categoryId1 || undefined,
          categoryId2: categoryId2 || undefined,
          categoryId3: categoryId3 || undefined,
        };

        const response = await fetchVideosList(params);

        if (!response?.page) {
          throw new Error('Failed to fetch contents!');
        }

        setContents((prev) =>
          isScrollFetch
            ? [...prev, ...(response.page || [])]
            : response.page || []
        );
        setTotalItems(response.total_items || 0);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [categoryId1, categoryId2, categoryId3, isMe, limit, status, title]
  );

  useEffect(() => {
    const prevDeps = prevDepsRef.current;

    // Check if any of the tracked dependencies have changed
    const isChanged =
      prevDeps.status !== status ||
      prevDeps.categoryId1 !== categoryId1 ||
      prevDeps.categoryId2 !== categoryId2 ||
      prevDeps.categoryId3 !== categoryId3 ||
      prevDeps.title !== title;

    if (isChanged) {
      // Clear contents and fetch new data
      setContents([]);
      setCurrentPage(1);
      fetchContentsData(1, false);

      // Update the previous dependencies with new ones
      prevDepsRef.current = {
        status,
        categoryId1,
        categoryId2,
        categoryId3,
        title,
      };
    }

    const getContents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params: Record<string, unknown> = {
          page,
          limit,
          status,
          title,
          isMe,
        };

        if (categoryId1 !== 0) params.categoryId1 = categoryId1;
        if (categoryId2 !== 0) params.categoryId2 = categoryId2;
        if (categoryId3 !== 0) params.categoryId3 = categoryId3;

        const response = await fetchVideosList(params);

        if (!response?.page) {
          throw new Error('Failed to fetch contents!');
        }

        setContents((prev) => [...prev, ...(response.page || [])]);
        setTotalItems(response.total_items || 0);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    getContents();
  }, [
    fetchContentsData,
    refetchKey,
    page,
    limit,
    status,
    title,
    isMe,
    categoryId1,
    categoryId2,
    categoryId3,
  ]);

  return {
    contents,
    isLoading,
    totalItems,
    error,
    refetchContents,
    fetchNextPage,
  };
};

export default useContents;
