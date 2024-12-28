import { useEffect, useRef, useState } from 'react';
import AppLayout from '@/layouts/AppLayout';
import DefaultPf from '@/assets/images/pf.png';
import { Button } from '@/components/ui/button';
import AppAvatar from '@/components/AppAvatar';
import VideoDescriptionBox from '@/components/VideoDescriptionBox';
import useVideoDetails from '@/hooks/useVideoDetails';
import { useParams } from 'react-router-dom';
import { formatReactionCount } from '@/lib/utils';
import Reactions from '@/components/Chat/Reactions';
import { Reaction, ReactionStats } from '@/data/chat';
import { addView, reactOnVideo, subscribeUnsubscribe } from '@/services/stream';
import { RECORD_VIEW_AFTER_SECONDS } from '@/data/validations';
import VideoComment from '@/components/VideoComment';
import { Sparkles, SquarePlay, VideoOff } from 'lucide-react';
import { FEED_PATH } from '@/data/route';
import NotFoundCentered from '@/components/NotFoundCentered';
import FullscreenLoading from '@/components/FullscreenLoading';
import VideoPlayerFLV from '@/components/VideoPlayerFLV';

const WatchVideo = () => {
  const { id: videoId } = useParams<{ id: string }>();

  const { videoDetails, isLoading: isFetching } = useVideoDetails({
    id: videoId || null,
  });

  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const uploaderRef = useRef<HTMLDivElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  // video ui
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // subscription
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribedCount, setSubscribedCount] = useState(0);
  // view
  const [viewsCount, setViewsCount] = useState(0);
  // reaction
  const [currentReactionType, setCurrentReactionType] =
    useState<Reaction | null>(null);
  const [reactionStats, setReactionStats] = useState<ReactionStats>({});

  const handleSubscribeUnsubscribe = async () => {
    if (videoDetails && videoDetails?.user_id) {
      const isSuccess = await subscribeUnsubscribe(videoDetails?.user_id);
      if (isSuccess) {
        if (isSubscribed) setSubscribedCount((prev) => prev - 1);
        else setSubscribedCount((prev) => prev + 1);

        setIsSubscribed(!isSubscribed);
      }
    }
  };

  const handleReactOnVideo = async ({ reaction }: { reaction: Reaction }) => {
    if (videoDetails) {
      const data = await reactOnVideo({
        videoId: videoDetails?.id,
        likeStatus: currentReactionType !== reaction,
        likeType: reaction,
      });
      if (data) {
        setReactionStats(data);
        if (currentReactionType === reaction) setCurrentReactionType(null);
        else setCurrentReactionType(reaction);
      }
    }
  };

  // make sure video is always in aspect ratio and when on lg screen sizes, title and uploader info should be appear in visible viewport without needing to scroll
  useEffect(() => {
    const calculateVideoHeight = () => {
      if (titleRef.current && uploaderRef.current) {
        const titleHeight = titleRef.current.offsetHeight;
        const uploaderHeight = uploaderRef.current.offsetHeight;
        const totalOffset = 140; // offset for headers, margins, etc.
        const availableHeight =
          window.innerHeight - totalOffset - (titleHeight + uploaderHeight);

        const videoHeight = Math.max(availableHeight, 0);
        const videoWidth = (16 / 9) * videoHeight;

        setVideoDimensions({ width: videoWidth, height: videoHeight });
      }
    };

    calculateVideoHeight();

    window.addEventListener('resize', calculateVideoHeight);

    return () => {
      window.removeEventListener('resize', calculateVideoHeight);
    };
  }, []);

  // update subscribe button, views count, current reaction type
  useEffect(() => {
    if (videoDetails) {
      setIsSubscribed(videoDetails?.is_subscribed);
      setSubscribedCount(videoDetails?.subscriptions);

      setViewsCount(videoDetails?.views);

      if (videoDetails?.current_like_type)
        setCurrentReactionType(videoDetails.current_like_type as Reaction);

      setReactionStats(videoDetails.likes);
    }
  }, [videoDetails]);

  // add view count after few seconds
  useEffect(() => {
    const addViewAfterDelay = async () => {
      if (videoDetails && videoDetails?.id && !isFetching) {
        const isSuccess = await addView(videoDetails?.id);
        if (isSuccess) {
          setViewsCount((prev) => prev + 1);
        }
      }
    };

    const timer = setTimeout(() => {
      addViewAfterDelay();
    }, RECORD_VIEW_AFTER_SECONDS * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [videoDetails, isFetching]);

  if (!videoId)
    return (
      <AppLayout>
        <NotFoundCentered
          Icon={<VideoOff className="text-white" />}
          title="No Video Found!"
          description="This video is not available anymore."
          redirectTo={{
            Icon: <SquarePlay className="h-4 w-4" />,
            buttonText: 'Watch Videos',
            link: FEED_PATH,
          }}
        />
      </AppLayout>
    );

  if (isFetching) {
    return (
      <AppLayout>
        <FullscreenLoading />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col pt-0 space-y-6 min-h-screen">
        {/* Video Section */}
        <div className="w-full flex justify-center bg-black border">
          <div
            ref={videoContainerRef}
            className="relative shadow-lg w-full"
            style={{
              width: videoDimensions ? `${videoDimensions.width}px` : 'auto',
              height: videoDimensions ? `${videoDimensions.height}px` : 'auto',
            }}
          >
            <VideoPlayerFLV videoUrl={videoDetails?.video_url || ''} />
          </div>
        </div>

        <h1 ref={titleRef} className="title text-xl font-bold">
          {videoDetails?.title || 'No Title'}
        </h1>

        {/* Uploader and Interaction Section */}
        <div ref={uploaderRef} className="flex space-y-4 items-center">
          <div className="flex items-center space-x-4 flex-1">
            <AppAvatar
              url={videoDetails?.avatar_file_url || DefaultPf}
              classes="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="text-md font-medium">
                {videoDetails?.display_name}
              </h3>
              <p className="text-gray-400 text-sm">
                {formatReactionCount(subscribedCount)} Subscribers
              </p>
            </div>
            {!videoDetails?.is_owner && (
              <Button
                onClick={handleSubscribeUnsubscribe}
                variant={`${isSubscribed ? 'secondary' : 'default'}`}
                className="px-4 py-2 rounded-lg ml-5"
              >
                {isSubscribed ? (
                  <>
                    <Sparkles className="fill-primary text-primary" />
                    Subscribed
                  </>
                ) : (
                  'Subscribe'
                )}
              </Button>
            )}
          </div>
          <div className="flex space-x-2 items-center">
            <Reactions
              stats={{
                likeCount: 0,
                likeInfo: reactionStats,
                currentReactionType: currentReactionType as Reaction,
              }}
              onReactOnLive={handleReactOnVideo}
            />
          </div>
        </div>

        {/* Description Box */}
        <VideoDescriptionBox
          totalViews={viewsCount}
          createdAt={videoDetails?.started_at}
          description={videoDetails?.description}
        />

        {/* Comment box */}
        {videoDetails && <VideoComment videoId={videoDetails?.id} />}
      </div>
    </AppLayout>
  );
};

export default WatchVideo;
