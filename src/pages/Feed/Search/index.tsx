import AppLayout from '@/layouts/AppLayout';
import { SEARCH_QUERY_KEYWORD } from '@/data/route';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/data/validations';
import useVideosList from '@/hooks/useVideosList';
import { useLocation } from 'react-router-dom';

const FeedSearch = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get(SEARCH_QUERY_KEYWORD);

  // fetch videos
  const {
    contents,
    totalItems,
    isLoading: isContentsFetching,
    error: contentFetchError,
    refetchContents,
    fetchNextPage,
  } = useVideosList({
    page: DEFAULT_PAGE,
    limit: DEFAULT_PAGE_SIZE,
    title: query || '',
  });

  return <AppLayout>{query}</AppLayout>;
};

export default FeedSearch;
