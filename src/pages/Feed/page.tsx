import React from 'react';
import {
  DEFAULT_LG_VIDEO_API_SIZE,
  DEFAULT_MD_VIDEO_API_SIZE,
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
import VideoItem from '@/components/VideoItem';
import { debounce } from 'lodash';
import { useCategory } from '@/context/CategoryContext';
import { FixedCategories } from '@/data/types/category';
import { CONTENT_STATUS } from '@/data/types/stream';
import { useScreenSize } from '@/hooks/useScreenSize';
import { Skeleton } from '@/components/ui/skeleton';

const FeedPage = () => {
  // fetch videos limit based on screen size
  const screenSize = useScreenSize();
  const getLimitForScreenSize = () => {
    switch (screenSize) {
      case 'sm':
        return DEFAULT_SM_VIDEO_API_SIZE;
      case 'md':
        return DEFAULT_MD_VIDEO_API_SIZE;
      case 'lg':
        return DEFAULT_LG_VIDEO_API_SIZE;
      default:
        return DEFAULT_SM_VIDEO_API_SIZE;
    }
  };

  const { filteredCategory } = useCategory();
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
    limit: getLimitForScreenSize(),
    categoryId1:
      filteredCategory?.id === FixedCategories[0].id ||
      filteredCategory?.id === FixedCategories[1].id
        ? undefined
        : filteredCategory.id,
    status:
      filteredCategory?.id === FixedCategories[1].id
        ? CONTENT_STATUS.LIVE
        : undefined,
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

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredCategory]);

  const renderSkeletons = () => {
    const skeletonsCount = getLimitForScreenSize();
    return Array.from({ length: skeletonsCount }).map((_, index) => (
      <div key={index} className="w-full h-full">
        <Skeleton className="w-full h-48 bg-secondary" />
      </div>
    ));
  };

  return (
    <React.Fragment>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto mt-10">
        {/* Videos List */}
        {isLoading
          ? renderSkeletons()
          : !isFetchingError &&
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

      {!isFetchingError && !isLoading && !hasMore && videos?.length > 0 && (
        <EndOfResults />
      )}

      {isFetchingError && (
        <FetchingError isLoading={isLoading} onRefetch={refetchVideos} />
      )}
    </React.Fragment>
  );
};

export default FeedPage;
