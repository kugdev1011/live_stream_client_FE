import VideoItem from '@/components/VideoItem';
import { VIDEO_ITEM_STYLE } from '@/data/types/ui/video';
import { DATA_API_LIMIT, DEFAULT_PAGE } from '@/data/validations';
import { useScreenSize } from '@/hooks/useScreenSize';
import useVideosList from '@/hooks/useVideosList';
import AppLayout from '@/layouts/AppLayout';
import LayoutHeading from '@/layouts/LayoutHeading';
import { useCallback, useRef, useState } from 'react';
import EndOfResults from '../../components/EndOfResults';
import InlineLoading from '@/components/InlineLoading';
import NotFoundCentered from '@/components/NotFoundCentered';
import { VideoOff } from 'lucide-react';
import ApiFetchingError from '@/components/ApiFetchingError';

const title = 'Liked Videos';

const LikedVideos = () => {
  const screenSize = useScreenSize();
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);

  const {
    videos,
    totalItems,
    hasMore,
    isLoading,
    error: isFetchingError,
    refetchVideos,
  } = useVideosList({
    page: currentPage,
    limit: DATA_API_LIMIT[screenSize], // fetch videos based on screen size
    is_liked: true,
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
        <div className="w-full">
          <LayoutHeading title={`${title} (${totalItems})`} />
        </div>

        <div className="flex flex-col justify-center gap-4">
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

        {!isFetchingError && !isLoading && !hasMore && videos?.length > 0 && (
          <EndOfResults />
        )}

        {!isFetchingError && isLoading && <InlineLoading />}

        {!isFetchingError && !isLoading && videos.length === 0 && (
          <NotFoundCentered
            Icon={<VideoOff className="text-white" />}
            title="No Video Found!"
            description="Please try searching with different filters."
          />
        )}

        {isFetchingError && (
          <ApiFetchingError
            label="Sorry, can't fetch liked videos right now!"
            isLoading={isLoading}
            onRefetch={refetchVideos}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default LikedVideos;
