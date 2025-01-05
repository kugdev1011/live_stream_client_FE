import React from 'react';
import { StreamsResponse } from '@/data/dto/stream';
import { getMicrosecondsToHHMMSS, getTimeAgoFormat } from '@/lib/date-time';
import { Badge } from '../ui/badge';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FEED_SEARCH_PATH,
  STREAMER_PROFILE_PATH,
  WATCH_LIVE_PATH,
  WATCH_VIDEO_PATH,
} from '@/data/route';
import { CONTENT_STATUS } from '@/data/types/stream';
import TooltipComponent from '../TooltipComponent';
import AuthImage from '../AuthImage';
import AppAvatar from '../AppAvatar';
import { useIsMobile } from '@/hooks/useMobile';
import { VIDEO_ITEM_STYLE } from '@/data/types/ui/video';

interface VideoItemProps {
  video: StreamsResponse;
  style?: VIDEO_ITEM_STYLE;
}

const VideoItem: React.FC<VideoItemProps> = ({ video, style }) => {
  const location = useLocation();
  const isSearchPage = location.pathname.includes(FEED_SEARCH_PATH);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const isFlexStyle = !isMobile && style === VIDEO_ITEM_STYLE.FLEX_ROW;
  const isFlexStyleMobile = isMobile && style === VIDEO_ITEM_STYLE.FLEX_ROW;

  const isLive = video.status === CONTENT_STATUS.LIVE;

  const handleWatchVideo = () => {
    let path = '';
    if (isLive) path = WATCH_LIVE_PATH.replace(':id', video.id.toString());
    else path = WATCH_VIDEO_PATH.replace(':id', video.id.toString());
    navigate(path);
  };

  return (
    <div
      className={`overflow-hidden relative cursor-pointer ${
        isFlexStyle ? 'flex gap-3' : ''
      }`}
      onClick={handleWatchVideo}
    >
      {/* thumbnail */}
      <div
        className={`overflow-hidden aspect-video rounded-lg hover:rounded-none border border-transparent hover:border-primary hover:border-4 transition-all ease-in-out duration-300 ${
          isSearchPage ? 'md:max-w-[350px] md:min-w-[240px]' : ''
        } ${video?.status === CONTENT_STATUS.VIDEO ? 'relative' : ''}`}
      >
        {/* live status */}
        {video?.status === CONTENT_STATUS.LIVE && (
          <Badge
            variant="destructive"
            className="absolute top-2.5 left-2.5 bg-red-600 text-white text-xs font-bold py-0.5 px-1 rounded-[5px]"
          >
            LIVE
          </Badge>
        )}

        {/* duration */}
        {video?.status === CONTENT_STATUS.VIDEO && (
          <OverlayStats
            classes="top-2 left-2"
            content={getMicrosecondsToHHMMSS(video?.duration)}
          />
        )}

        {/* views */}
        <OverlayStats
          classes="bottom-2 left-2"
          content={`${video?.views} view${video?.views > 1 ? 's' : ''}`}
        />

        {/* uploaded/streamed time */}
        <OverlayStats
          classes="bottom-2 right-2"
          content={`${
            video.status === 'live'
              ? `Live ${getTimeAgoFormat(video.started_at)}`
              : getTimeAgoFormat(video.started_at)
          }`}
        />

        {/* thumbnail image */}
        <AuthImage
          src={video.thumbnail_url}
          alt={video.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex gap-4 mt-3">
        {style !== VIDEO_ITEM_STYLE.FLEX_ROW && (
          <AppAvatar url={video?.avatar_file_url || ''} />
        )}

        <div className={`space-y-${isFlexStyle ? '2' : '1'}`}>
          {/* title - 2 lines at most */}
          <TooltipComponent
            text={video.title}
            children={
              <p
                className={`${
                  isFlexStyle ? 'text-base md:text-lg lg:text-xl' : 'text-base'
                } hover:text-primary font-bold line-clamp-2 text-ellipsis`}
              >
                {video.title}
              </p>
            }
          />

          {/* avatar and streamer name */}
          <div
            className={`${
              isFlexStyle || isFlexStyleMobile
                ? 'flex gap-2 items-center'
                : 'flex gap-2'
            }`}
          >
            {(isFlexStyle || isFlexStyleMobile) && (
              <AppAvatar url={video?.avatar_file_url || ''} />
            )}
            <NavLink
              to={`${STREAMER_PROFILE_PATH}/${video.user_id}`}
              className="text-sm font-medium text-muted-foreground"
            >
              {video.display_name}
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoItem;

const OverlayStats = ({
  content,
  classes,
}: {
  content: string | JSX.Element;
  classes: string;
}) => {
  return (
    <div
      className={`absolute bg-black/40 backdrop-blur text-white z-10 text-xs p-1 py-0.5 rounded-[5px] ${classes}`}
    >
      {content}
    </div>
  );
};
