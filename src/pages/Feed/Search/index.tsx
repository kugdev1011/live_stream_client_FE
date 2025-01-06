import AppLayout from '@/layouts/AppLayout';
import { CATEGORY_FILTER_KEYWORD, SEARCH_QUERY_KEYWORD } from '@/data/route';
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
import VideoItem from '@/components/VideoItem';
import InlineLoading from '../../../components/InlineLoading';
import FetchingError from '../FetchingError';
import { useIsMobile } from '@/hooks/useMobile';
import { FixedCategories } from '@/data/types/category';
import { CONTENT_STATUS } from '@/data/types/stream';

const FeedSearch = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const _searchQuery = params.get(SEARCH_QUERY_KEYWORD);
  const _fCategoryId = params.get(CATEGORY_FILTER_KEYWORD);
  const _filteredCategoryId = isNaN(Number(_fCategoryId))
    ? undefined
    : Number(_fCategoryId);
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
    title: _searchQuery || undefined,
    categoryId1:
      _filteredCategoryId === FixedCategories[0].id ||
      _filteredCategoryId === FixedCategories[1].id
        ? undefined
        : _filteredCategoryId,
    status:
      _filteredCategoryId === FixedCategories[1].id
        ? CONTENT_STATUS.LIVE
        : undefined,
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
      <div className="md:container lg:px-[10rem] md:mx-auto flex flex-col justify-center gap-4 mt-10">
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
        <FetchingError isLoading={isLoading} onRefetch={refetchVideos} />
      )}
    </AppLayout>
  );
};

export default FeedSearch;
