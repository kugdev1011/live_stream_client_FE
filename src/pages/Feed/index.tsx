import AppLayout from '@/layouts/AppLayout';
import {
  DEFAULT_LG_VIDEO_API_SIZE,
  DEFAULT_PAGE,
  DEFAULT_SM_VIDEO_API_SIZE,
} from '@/data/validations';
import useVideosList from '@/hooks/useVideosList';
import { VideoOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import FetchingError from './FetchingError';
import EndOfResults from './EndOfResults';
import NotFoundCentered from '@/components/NotFoundCentered';
import { VIDEO_ITEM_STYLE } from '@/data/types/ui/video';
import InlineLoading from '@/components/InlineLoading';
import VideoItem from '@/components/VideosList/VideoItem';
import { debounce } from 'lodash';
import { useIsMobile } from '@/hooks/useMobile';

const Feed = () => {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);

  // fetch videos
  const {
    videos,
    hasMore,
    isLoading,
    error: isFetchingError,
    refetchVideos,
  } = useVideosList({
    page: currentPage,
    limit: isMobile ? DEFAULT_SM_VIDEO_API_SIZE : DEFAULT_LG_VIDEO_API_SIZE,
  });

  const handleScroll = debounce(() => {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const clientHeight = window.innerHeight;

    const bottom = scrollTop + clientHeight >= scrollHeight;

    if (bottom && hasMore && !isLoading) setCurrentPage((prev) => prev + 1);
  }, 500);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <AppLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-screen overflow-y-auto">
        {/* Videos List */}
        {!isFetchingError &&
          videos.length > 0 &&
          videos.map((video, index) => {
            return (
              <VideoItem
                key={index}
                video={video}
                style={VIDEO_ITEM_STYLE.FLEX_COL}
              />
            );
          })}

        {!isFetchingError && !isLoading && videos.length === 0 && (
          <NotFoundCentered
            Icon={<VideoOff className="text-white" />}
            title="No Video Found!"
            description="Please try searching with different filters."
          />
        )}
      </div>

      {!isFetchingError && isLoading && <InlineLoading />}

      {!isFetchingError && !isLoading && !hasMore && <EndOfResults />}

      {isFetchingError && (
        <FetchingError isLoading={isLoading} onRefetch={refetchVideos} />
      )}
    </AppLayout>
  );
};

export default Feed;
