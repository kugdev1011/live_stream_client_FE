import { useState, useEffect } from 'react';
import { fetchContents } from '@/services/stream';
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

  useEffect(() => {
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

        const response = await fetchContents(params);

        if (!response?.page) {
          throw new Error('Failed to fetch contents!');
        }

        setContents(response.page || []);
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

  const refetchContents = () => {
    setRefetchKey((prevKey) => prevKey + 1);
  };

  return { contents, isLoading, totalItems, error, refetchContents };
};

export default useContents;
