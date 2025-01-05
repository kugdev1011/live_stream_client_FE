import React from 'react';
import VideoItem from './VideoItem';
import { StreamsResponse } from '@/data/dto/stream';
import { VIDEO_ITEM_STYLE, VIDEO_LIST_STYLE } from '@/data/types/ui/video';

interface VideosListProps {
  style: VIDEO_LIST_STYLE;
  videos: StreamsResponse[];
}

const VideosList: React.FC<VideosListProps> = ({ videos, style }) => {
  return (
    <div
      className={`${
        style === VIDEO_LIST_STYLE.GRID
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'md:container lg:px-[10rem] md:mx-auto flex flex-col justify-center gap-4'
      }`}
    >
      {videos.map((video, index) => (
        <VideoItem
          key={index}
          video={video}
          style={
            style === VIDEO_LIST_STYLE.GRID
              ? VIDEO_ITEM_STYLE.FLEX_COL
              : VIDEO_ITEM_STYLE.FLEX_ROW
          }
        />
      ))}
    </div>
  );
};

export default VideosList;
