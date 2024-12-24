import FullscreenLoading from '@/components/FullscreenLoading';
import { MultiSelect } from '@/components/MultiSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import VideosList from '@/components/VideosList';
import { CONTENT_STATUS } from '@/data/types/stream';
import { MAX_CATEGORY_COUNT } from '@/data/validations';
import useCategories from '@/hooks/useCategories';
import useContents from '@/hooks/useContents';
import AppLayout from '@/layouts/AppLayout';
import LayoutHeading from '@/layouts/LayoutHeading';
import { AlertCircle, RotateCw, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const title = 'Feed';

const Feed = () => {
  const listRef = useRef<HTMLDivElement | null>(null);

  const [isLiveView, setIsLiveView] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
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
    isLoading: isContentsLoading,
    error: contentFetchError,
    refetchContents,
    fetchNextPage,
  } = useContents({
    page: 1,
    limit: 10,
    status: isLiveView ? CONTENT_STATUS.LIVE : undefined,
    categoryId1: selectedCategories[0]
      ? Number(selectedCategories[0])
      : undefined,
    categoryId2: selectedCategories[1]
      ? Number(selectedCategories[1])
      : undefined,
    categoryId3: selectedCategories[2]
      ? Number(selectedCategories[2])
      : undefined,
    title: debouncedSearchTerm,
  });

  const handleScroll = useCallback(() => {
    if (!listRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isBottom = scrollTop + clientHeight >= scrollHeight - 5;

    setIsAtBottom(isBottom);

    if (!isContentsLoading && isBottom) {
      fetchNextPage();
    }
  }, [fetchNextPage, isContentsLoading]);

  const handleLiveViewChange = (value: boolean) => {
    setIsLiveView(value);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    const currentRef = listRef.current;
    if (currentRef) currentRef.addEventListener('scroll', handleScroll);

    return () => {
      if (currentRef) currentRef.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <AppLayout title={title}>
      <LayoutHeading title={title} />

      <div className="flex items-center justify-center gap-3">
        <div className="relative w-1/2 md:w-1/3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            type="text"
            placeholder="Search"
            className="pl-10 py-[19px]"
          />
        </div>

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

        <div className="flex items-center space-x-2 border rounded-md p-[9px]">
          <Switch
            id="airplane-mode"
            checked={isLiveView}
            onCheckedChange={handleLiveViewChange}
          />
          <Label htmlFor="airplane-mode">LIVE</Label>
        </div>
      </div>

      <div ref={listRef} className="overflow-y-auto h-[calc(100vh-100px)]">
        {!contentFetchError && contents.length > 0 ? (
          <VideosList videos={contents} />
        ) : (
          !isContentsLoading && (
            <div className="flex flex-col justify-center items-center mt-20 space-y-3 ">
              <div className="bg-red-200 dark:bg-red-800 p-2 rounded-full">
                <AlertCircle className="text-red-500" />
              </div>
              <p className="text-base font-medium">
                Sorry, can't fetch videos right now!
              </p>
              <Button variant="outline" onClick={refetchContents}>
                <RotateCw className="w-4 h-4" />
                {isContentsLoading ? 'Retrying...' : 'Retry'}
              </Button>
            </div>
          )
        )}
      </div>

      {isContentsLoading && <FullscreenLoading />}
      {!isContentsLoading && contents.length === totalItems && isAtBottom && (
        <div className="flex justify-center items-center">
          <span className="flex gap-1 items-center bg-primary text-center mt-4 text-white text-xs px-3 py-1 rounded-full">
            <AlertCircle className="w-3 h-3 text-white" /> End of results
          </span>
        </div>
      )}
    </AppLayout>
  );
};

export default Feed;
