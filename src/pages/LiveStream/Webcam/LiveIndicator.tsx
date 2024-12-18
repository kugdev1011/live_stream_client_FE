import moment from 'moment';
import { Heart, MessageSquare, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ComponentProps {
  isStreamStarted: boolean;
  viewerCount: number;
  likeCount: number; // here, like means all types of emotions
  commentCount: number;
}

const LiveIndicator = (props: ComponentProps) => {
  const { isStreamStarted, viewerCount, likeCount, commentCount } = props;

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreamStarted]);

  const formatTime = (secs: number) => {
    return moment.utc(secs * 1000).format('mm:ss');
  };

  if (!isStreamStarted) return null;

  return (
    <div className="flex gap-2">
      <div className="flex items-center space-x-2 bg-red-500 text-white rounded-sm px-2 py-1 text-xs shadow-md">
        <span className="font-bold uppercase text-xs">Live</span>
        <span style={{ width: '40px', textAlign: 'center' }}>
          {formatTime(seconds)}
        </span>
      </div>
      <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-md rounded-sm px-2 py-1 text-sm text-gray-800 shadow-md">
        <Users className="w-3 h-3" />
        <span className="font-medium text-xs">
          {viewerCount || 0} <span className="hidden md:inline">Viewers</span>
        </span>
      </div>
      <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-md rounded-sm px-2 py-1 text-sm text-gray-800 shadow-md">
        <Heart className="w-3 h-3" />
        <span className="font-medium text-xs">
          {likeCount || 0} <span className="hidden md:inline">Likes</span>
        </span>
      </div>
      <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-md rounded-sm px-2 py-1 text-sm text-gray-800 shadow-md">
        <MessageSquare className="w-3 h-3" />
        <span className="font-medium text-xs">
          {commentCount || 0} <span className="hidden md:inline">Comments</span>
        </span>
      </div>
    </div>
  );
};

export default LiveIndicator;
