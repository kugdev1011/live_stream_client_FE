import AppLayout from '@/layouts/AppLayout';
import { SEARCH_QUERY_KEYWORD } from '@/data/route';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/data/validations';
import useVideosList from '@/hooks/useVideosList';
import { useLocation } from 'react-router-dom';
import NotFoundCentered from '@/components/NotFoundCentered';
import { VideoOff } from 'lucide-react';
import FullscreenLoading from '@/components/FullscreenLoading';
import { VIDEO_LIST_STYLE } from '@/data/types/ui/video';
import VideosList from '@/components/VideosList';

const FeedSearch = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get(SEARCH_QUERY_KEYWORD);

  // fetch videos
  const {
    contents,
    // totalItems,
    isLoading: isContentsFetching,
    error: contentFetchError,
    // refetchContents,
    // fetchNextPage,
  } = useVideosList({
    page: DEFAULT_PAGE,
    limit: DEFAULT_PAGE_SIZE,
    title: query || '',
  });

  return (
    <AppLayout>
      {!isContentsFetching && !contentFetchError && contents.length > 0 && (
        <VideosList videos={contents} style={VIDEO_LIST_STYLE.LIST} />
      )}

      {/* No results */}
      {!isContentsFetching && contents.length === 0 && (
        <NotFoundCentered
          Icon={<VideoOff className="text-white" />}
          title="No Video Found!"
          description="Please try searching with different filters."
        />
      )}

      {/* Loading... */}
      {isContentsFetching && <FullscreenLoading />}
    </AppLayout>
  );
};

export default FeedSearch;
