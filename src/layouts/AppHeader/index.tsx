import { SidebarTriggerHangBurger } from '@/components/CustomSidebar';
import { siteData } from '@/data/site';
import UserAvatar from './UserAvatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, PodcastIcon, Radio, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FEED_PATH, LIVE_STREAM_PATH } from '@/data/route';
import useUserAccount from '@/hooks/useUserAccount';
import { USER_ROLE } from '@/data/types/role';
import React, { useEffect, useMemo, useState } from 'react';
import { EVENT_EMITTER_NAME, EventEmitter } from '@/lib/event-emitter';
import { Badge } from '@/components/ui/badge';
import TooltipComponent from '@/components/TooltipComponent';
import { useFeedSearch } from '@/context/SearchContext';
import { debounce } from 'lodash';
import { useIsMobile } from '@/hooks/useMobile';
import SearchBox from './SearchBox';

const AppHeader = React.memo(() => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { setSearchTerm } = useFeedSearch();
  const currentUser = useUserAccount();
  const handleGoLive = () => navigate(LIVE_STREAM_PATH);

  const [isStreamingLive, setIsStreamingLive] = useState(false);
  const [isSmallSearchExpanded, setIsSmallSearchExpanded] = useState(false);

  const debouncedSetSearchTerm = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
      }, 500),
    [setSearchTerm]
  );

  const handleLiveStart = () => setIsStreamingLive(true);
  const handleLiveEnd = () => setIsStreamingLive(false);

  // event subscribes
  EventEmitter.subscribe(EVENT_EMITTER_NAME.LIVE_STREAM_START, handleLiveStart);
  EventEmitter.subscribe(EVENT_EMITTER_NAME.LIVE_STREAM_END, handleLiveEnd);

  useEffect(() => {
    // Cleanup subscription on unmount
    return () => {
      EventEmitter.unsubscribe(
        EVENT_EMITTER_NAME.LIVE_STREAM_START,
        handleLiveStart
      );

      EventEmitter.unsubscribe(
        EVENT_EMITTER_NAME.LIVE_STREAM_END,
        handleLiveEnd
      );
    };
  }, []);

  useEffect(() => {
    return () => debouncedSetSearchTerm.cancel();
  }, [debouncedSetSearchTerm]);

  useEffect(() => {
    if (!isMobile) setIsSmallSearchExpanded(false);
  }, [isMobile]);

  return (
    <header className="flex justify-between fixed w-full top-0 py-2 bg-background border-b shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:py-3 z-50">
      {!isSmallSearchExpanded && (
        <div className="px-4 flex items-center gap-1">
          <SidebarTriggerHangBurger />
          <Button
            variant="ghost"
            onClick={() => navigate(FEED_PATH)}
            size="lg"
            className="px-2 w-[146px]"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground">
              {siteData.logo && <siteData.logo />}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{siteData.name}</span>
              <span className="truncate text-xs">{siteData.description}</span>
            </div>
          </Button>

          {/* md: search box */}
          <div className="hidden md:block lg:hidden">
            <SearchBox onSearch={(value) => debouncedSetSearchTerm(value)} />
          </div>
        </div>
      )}

      {/* lg: search box */}
      <div className="w-1/2 md:w-1/3 hidden lg:block">
        <SearchBox onSearch={(value) => debouncedSetSearchTerm(value)} />
      </div>

      {/* sm: search box is expanded in mobile devices */}
      {isSmallSearchExpanded && (
        <div className="flex gap-3 w-full mx-4">
          <TooltipComponent
            text="Back"
            children={
              <Button
                variant="outline"
                onClick={() => setIsSmallSearchExpanded(false)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            }
          />
          <div className="w-full">
            <SearchBox onSearch={(value) => debouncedSetSearchTerm(value)} />
          </div>
        </div>
      )}

      {/* sm: search box collapsed */}
      {!isSmallSearchExpanded && (
        <div className="flex px-4 justify-between items-center">
          <div className="ml-auto flex gap-3 items-center">
            <div className="block md:hidden">
              <TooltipComponent
                align="center"
                text="Search videos"
                children={
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setIsSmallSearchExpanded(true);
                    }}
                  >
                    <Search className="w-6 h-6" />
                  </Button>
                }
              />
            </div>

            {currentUser && currentUser.role_type === USER_ROLE.STREAMER && (
              <>
                {isStreamingLive ? (
                  <Badge
                    variant="destructive"
                    className="bg-red-600 gap-1 rounded-sm"
                  >
                    <PodcastIcon className="w-3 h-3" /> LIVE
                  </Badge>
                ) : (
                  <Button size="sm" onClick={handleGoLive}>
                    <Radio />
                    Go Live
                  </Button>
                )}
              </>
            )}
            <TooltipComponent
              text="Notifications"
              align="center"
              children={
                <Button size="sm" variant="secondary">
                  <Bell className="w-6 h-6" />
                </Button>
              }
            />
            <UserAvatar />
          </div>
        </div>
      )}
    </header>
  );
});

export default AppHeader;
