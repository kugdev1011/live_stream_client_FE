import { useState, useEffect } from 'react';
import { fetchVideosList } from '@/services/stream';
import { StreamsResponse, VideosListRequest } from '@/data/dto/stream';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/data/validations';

const useVideosList = (payload: VideosListRequest = {}) => {
  const {
    page = DEFAULT_PAGE,
    limit = DEFAULT_PAGE_SIZE,
    categoryId1 = 0,
    categoryId2 = 0,
    categoryId3 = 0,
    title = '',
    isMe = false,
  } = payload;

  const [videos, setVideos] = useState<StreamsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [refetchKey, setRefetchKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  const refetchVideos = () => {
    setRefetchKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    const fetchContentsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params: Record<string, unknown> = {
          page,
          limit,
          title,
          isMe,
          categoryId1: categoryId1 || undefined,
          categoryId2: categoryId2 || undefined,
          categoryId3: categoryId3 || undefined,
        };

        const response = await fetchVideosList(params);

        if (!response?.page) throw new Error('Failed to fetch contents!');

        setVideos((prev) => {
          const newVideos = response.page || [];
          const uniqueVideos = [
            ...prev,
            ...newVideos.filter(
              (video) => !prev.some((v) => v.id === video.id)
            ),
          ];
          return uniqueVideos;
        });
        if (response.next) setHasMore(response.next > 0);
        if (response.total_items) setTotalItems(response.total_items);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchContentsData();
  }, [
    title,
    categoryId1,
    categoryId2,
    categoryId3,
    page,
    limit,
    isMe,
    refetchKey,
  ]);

  useEffect(() => {
    setVideos([]);
  }, [title, categoryId1, categoryId2, categoryId3, isMe]);

  return {
    videos,
    isLoading,
    hasMore,
    totalItems,
    error,
    refetchVideos,
  };
};

export default useVideosList;
