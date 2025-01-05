import AppLayout from '@/layouts/AppLayout';
import { SEARCH_QUERY_KEYWORD } from '@/data/route';
import {
  DEFAULT_LG_VIDEO_API_SIZE,
  DEFAULT_PAGE,
  DEFAULT_SM_VIDEO_API_SIZE,
} from '@/data/validations';
import useVideosList from '@/hooks/useVideosList';
import { useLocation } from 'react-router-dom';
import NotFoundCentered from '@/components/NotFoundCentered';
import { VideoOff } from 'lucide-react';
import { VIDEO_ITEM_STYLE } from '@/data/types/ui/video';
import { useCallback, useRef, useState } from 'react';
import EndOfResults from '../EndOfResults';
import VideoItem from '@/components/VideosList/VideoItem';
import InlineLoading from '../../../components/InlineLoading';
import FetchingError from '../FetchingError';
import { useIsMobile } from '@/hooks/useMobile';

const FeedSearch = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get(SEARCH_QUERY_KEYWORD);
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
    title: query || '',
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastVideoElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setCurrentPage((prev) => prev + 1);
        }
      });
      if (node) observerRef.current.observe(node); // Observe the last element in the list
    },
    [isLoading, hasMore]
  );

  return (
    <AppLayout>
      <div className="md:container lg:px-[10rem] md:mx-auto flex flex-col justify-center gap-4">
        {!isFetchingError &&
          videos.length > 0 &&
          videos.map((video, index) => {
            if (videos.length === index + 1)
              return (
                <div ref={lastVideoElementRef}>
                  <VideoItem
                    key={index}
                    video={video}
                    style={VIDEO_ITEM_STYLE.FLEX_ROW}
                  />
                </div>
              );
            else
              return (
                <div>
                  <VideoItem
                    key={index}
                    video={video}
                    style={VIDEO_ITEM_STYLE.FLEX_ROW}
                  />
                </div>
              );
          })}
      </div>

      {!isFetchingError && !isLoading && !hasMore && <EndOfResults />}

      {!isFetchingError && isLoading && <InlineLoading />}

      {!isFetchingError && !isLoading && videos.length === 0 && (
        <NotFoundCentered
          Icon={<VideoOff className="text-white" />}
          title="No Video Found!"
          description="Please try searching with different filters."
        />
      )}

      {isFetchingError && (
        <FetchingError isLoading={isLoading} onRefetch={refetchVideos} />
      )}
    </AppLayout>
  );
};

export default FeedSearch;
