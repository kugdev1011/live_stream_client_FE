import FullscreenLoading from '@/components/FullscreenLoading';
import { MultiSelect } from '@/components/MultiSelect';
import VideosList from '@/components/VideosList';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_CATEGORY_COUNT,
} from '@/data/validations';
import useCategories from '@/hooks/useCategories';
import useVideosList from '@/hooks/useVideosList';
import { VideoOff } from 'lucide-react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import FetchingError from './FetchingError';
import EndOfResults from './EndOfResults';
import NotFoundCentered from '@/components/NotFoundCentered';

const FeedPage = () => {
  const listRef = useRef<HTMLDivElement | null>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(false);

  // fetch categories
  const {
    categories,
    isLoading: isCategoryLoading,
    error: categoryFetchError,
  } = useCategories();
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
    // status: isLiveView ? CONTENT_STATUS.LIVE : CONTENT_STATUS.VIDEO,
    categoryId1: selectedCategories[0]
      ? Number(selectedCategories[0])
      : undefined,
    categoryId2: selectedCategories[1]
      ? Number(selectedCategories[1])
      : undefined,
    categoryId3: selectedCategories[2]
      ? Number(selectedCategories[2])
      : undefined,
    // title: searchTerm,
  });

  const handleScroll = useCallback(() => {
    if (!listRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isBottom = scrollTop + clientHeight >= scrollHeight - 5;

    setIsAtBottom(isBottom);

    if (!isContentsFetching && isBottom) {
      fetchNextPage();
    }
  }, [fetchNextPage, isContentsFetching]);

  useEffect(() => {
    const currentRef = listRef.current;
    if (currentRef) currentRef.addEventListener('scroll', handleScroll);

    return () => {
      if (currentRef) currentRef.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <Fragment>
      <div className="flex items-center justify-center gap-3">
        <div className="w-1/2 md:w-1/3">
          <MultiSelect
            isError={!!categoryFetchError}
            isLoading={isCategoryLoading}
            options={categories?.map((cat) => ({
              id: cat.id.toString(),
              name: cat.name,
            }))}
            onValueChange={setSelectedCategories}
            defaultValue={selectedCategories}
            placeholder="Categories"
            animation={2}
            maxCount={MAX_CATEGORY_COUNT}
          />
        </div>
      </div>

      <div
        ref={listRef}
        className={`overflow-y-auto ${
          contents.length > 0 ? 'h-[calc(100vh-100px)]' : ''
        }`}
      >
        {/* Videos List */}
        {!contentFetchError && contents.length > 0 && (
          <VideosList videos={contents} />
        )}

        {/* Fetching error, api error, server down */}
        {!isContentsFetching && contents.length !== 0 && contentFetchError && (
          <FetchingError
            isLoading={isContentsFetching}
            onRefetch={refetchContents}
          />
        )}

        {/* No results */}
        {!isContentsFetching && contents.length === 0 && (
          <NotFoundCentered
            Icon={<VideoOff className="text-white" />}
            title="No Video Found!"
            description="Please try searching with different filters."
          />
        )}
      </div>

      {/* Loading... */}
      {isContentsFetching && <FullscreenLoading />}

      {/* Shows end of results */}
      {!isContentsFetching && contents.length === totalItems && isAtBottom && (
        <EndOfResults />
      )}
    </Fragment>
  );
};

export default FeedPage;
