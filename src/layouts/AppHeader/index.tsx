import { SearchBox } from '@/layouts/AppHeader/SearchBox';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { siteData } from '@/data/site';
import UserAvatar from './UserAvatar';
import { Button } from '@/components/ui/button';
import { PodcastIcon, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LIVE_STREAM_PATH } from '@/data/route';
import useUserAccount from '@/hooks/useUserAccount';
import { USER_ROLE } from '@/data/types/role';
import React, { useEffect, useState } from 'react';
import { EVENT_EMITTER_NAME, EventEmitter } from '@/lib/event-emitter';
import { Badge } from '@/components/ui/badge';

const AppHeader = React.memo(({ title }: { title?: string }) => {
  const navigate = useNavigate();
  const currentUser = useUserAccount();
  const handleGoLive = () => navigate(LIVE_STREAM_PATH);

  const [isStreamingLive, setIsStreamingLive] = useState(false);

  useEffect(() => {
    const handleStreamLive = () => {
      setIsStreamingLive(true);
    };

    EventEmitter.subscribe(
      EVENT_EMITTER_NAME.LIVE_STREAM_START,
      handleStreamLive
    );

    // Cleanup subscription on unmount
    return () => {
      EventEmitter.unsubscribe(
        EVENT_EMITTER_NAME.LIVE_STREAM_START,
        handleStreamLive
      );
    };
  }, []);

  return (
    <header className="flex sticky top-0 py-3 bg-background border-b shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:py-3 z-50">
      <div className="px-4 flex items-center gap-1 md:hidden">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground">
          {siteData.logo && <siteData.logo />}
        </div>
        <SidebarTrigger />
      </div>
      <div className="flex px-4 justify-between items-center w-full">
        <h1 className="hidden lg:block text-lg font-bold">{title}</h1>

        <div className="ml-auto flex gap-3 items-center">
          <SearchBox />
          <Separator orientation="vertical" className="h-4" />
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
              <Separator orientation="vertical" className="h-4" />
            </>
          )}
          <UserAvatar />
        </div>
      </div>
    </header>
  );
});

export default AppHeader;
