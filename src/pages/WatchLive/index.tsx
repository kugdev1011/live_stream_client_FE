import _ from 'lodash';
import { CONTENT_STATUS } from '@/data/types/stream';
import useVideoDetails from '@/hooks/useVideoDetails';
import AppLayout from '@/layouts/AppLayout';
import { useNavigate, useParams } from 'react-router-dom';
import LiveIndicator from '../LiveStream/Webcam/LiveIndicator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { LetterText, MessageSquare } from 'lucide-react';
import StreamDetailsCard from '../LiveStream/Webcam/StreamDetailsCard';
import { Fragment, useEffect, useRef, useState } from 'react';
import StreamerAvatar from '@/components/StreamerAvatar';
import { getFormattedDate } from '@/lib/date-time';
import { convertToHashtagStyle } from '@/lib/utils';
import VideoCategory from '@/components/VideoCategory';
import VideoPlayerFLV from '@/components/VideoPlayerFLV';
import { retrieveAuthToken } from '@/data/model/userAccount';
import Chat from '@/components/Chat';
import useUserAccount from '@/hooks/useUserAccount';
import {
  isLiveCommentInfoObj,
  LiveCommentInfo,
  LiveCommentRequest,
  LiveInitialStatsResponse,
  LiveInteractionType,
  LiveReactionRequest,
  LiveReactionResponse,
} from '@/data/dto/chat';
import { useIsMobile } from '@/hooks/useMobile';
import { NotifyModalType } from '@/components/UITypes';
import {
  NotificationModalProps,
  NotifyModal,
} from '@/components/NotificationModal';
import { WATCH_VIDEO_PATH } from '@/data/route';
import { OnReactOnLiveParams } from '@/components/Chat/Reactions';
import FullscreenLoading from '@/components/FullscreenLoading';

const WatchLive = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const currentUser = useUserAccount();
  const { id: videoId } = useParams<{ id: string }>();

  const { videoDetails, isLoading: isFetching } = useVideoDetails({
    id: videoId || null,
  });

  const chatWsRef = useRef<WebSocket | null>(null);

  const [isStreamStarted, setIsStreamStarted] = useState(false);
  const [liveViewersCount, setLiveViewersCount] = useState(0);
  const [liveInitialStats, setLiveInitialStats] =
    useState<LiveInitialStatsResponse>({
      type: LiveInteractionType.INITIAL,
      comments: [],
      like_count: 0,
      like_info: {},
      current_like_type: undefined,
    });
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number | string;
    height: number | string;
  }>({
    width: 0,
    height: 0,
  });
  const [notifyModal, setNotifyModal] = useState<NotificationModalProps>({
    type: NotifyModalType.SUCCESS,
    isOpen: false,
    title: '',
    description: '',
    onClose: undefined,
  });

  // Toggles chat visibility
  const handleToggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  const handleReactOnLive = ({ reaction }: OnReactOnLiveParams) => {
    if (!chatWsRef.current || chatWsRef.current.readyState !== WebSocket.OPEN) {
      console.error('Chat WebSocket is not open');
      return;
    }

    const likeStatus = liveInitialStats.current_like_type !== reaction;
    const message: LiveReactionRequest = {
      type: LiveInteractionType.LIKE,
      data: {
        like_status: likeStatus,
        like_type: reaction,
      },
    };

    chatWsRef.current.send(JSON.stringify(message));
  };

  const handleCommentOnLive = (content: string) => {
    if (!chatWsRef.current || chatWsRef.current.readyState !== WebSocket.OPEN) {
      console.error('Chat WebSocket is not open');
      return;
    }

    const message: LiveCommentRequest = {
      type: LiveInteractionType.COMMENT,
      data: { content },
    };

    chatWsRef.current.send(JSON.stringify(message));
  };

  useEffect(() => {
    if (videoDetails) {
      // prevent creating a new ws connection if one already exists
      if (
        chatWsRef.current &&
        chatWsRef.current.readyState === WebSocket.OPEN
      ) {
        console.log('Websocket connection already exists');
        return;
      }

      const token = retrieveAuthToken();
      if (!token) return;

      const chatWsURL = import.meta.env.VITE_WS_STREAM_URL;
      const chatWs = new WebSocket(
        `${chatWsURL}/${videoDetails.id}/interaction?token=${encodeURIComponent(
          token
        )}`
      );
      chatWsRef.current = chatWs;

      chatWs.onopen = () => {
        console.log('WebSocket connection for chat established');
        if (!isMobile) setIsChatVisible(true);
      };

      chatWs.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);

          // On receiving initial message
          if (response && response?.type === LiveInteractionType.INITIAL) {
            setLiveInitialStats(response);
          }
          // On receiving a reaction
          else if (response && response?.type === LiveInteractionType.LIKE) {
            const liveReactionResponse = response as LiveReactionResponse;
            setLiveInitialStats((prevStats) => {
              const { like_type, like_status } = liveReactionResponse.data;

              if (!like_status) {
                return {
                  ...prevStats,
                  current_like_type: undefined,
                };
              }

              const updatedStats = { ...prevStats };
              updatedStats.current_like_type = like_type;

              return updatedStats;
            });
          }
          // On commenting
          else if (response && isLiveCommentInfoObj(response)) {
            setLiveInitialStats((prevStats) => {
              const commentExists = prevStats.comments.some(
                (comment) => comment.id === response.id
              );

              if (commentExists) return prevStats;

              return {
                ...prevStats,
                comments: [
                  ...prevStats.comments,
                  response,
                ] as LiveCommentInfo[],
              };
            });
          }
          // On getting reactions stats
          else if (
            response &&
            response?.type === LiveInteractionType.LIKE_INFO
          ) {
            setLiveInitialStats((prevStats) => {
              const updatedStats = {
                ...prevStats,
                // like_count: response?.data?.total || prevStats.like_count,
                like_count: response?.data?.total || 0,
                like_info: { ...response?.data },
              };
              return updatedStats;
            });
          }
          // On getting viewers count update
          else if (
            response &&
            response?.type === LiveInteractionType.VIEW_INFO
          ) {
            setLiveViewersCount(response?.data?.total);
          }
          // On getting stream ended event
          else if (
            response &&
            response?.type === LiveInteractionType.LIVE_ENDED
          ) {
            setIsStreamStarted(false);

            openNotifyModal(
              NotifyModalType.ERROR,
              'Live Ended!',
              <p>
                You can watch this stream now in /app/video/{videoDetails?.id}
              </p>,
              () => {
                navigate(
                  WATCH_VIDEO_PATH.replace(':id', videoDetails?.id?.toString())
                );
              }
            );
          }
          // On getting empty result
          else if (_.isEmpty(response)) {
            setLiveInitialStats((prevStats) => {
              const updatedStats = {
                ...prevStats,
                like_count: 0,
                like_info: {},
                current_like_type: undefined,
              };
              return updatedStats;
            });
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      chatWs.onclose = () => {
        console.log('Chat WebSocket connection closed');
        setIsChatVisible(false);

        if (chatWs.readyState === WebSocket.OPEN) {
          chatWs.close();
        }
      };

      chatWs.onerror = (err) => {
        console.error('Chat WebSocket error:', err);
        setIsChatVisible(false);

        if (chatWs.readyState === WebSocket.OPEN) {
          chatWs.close();
        }
      };
    }

    return () => {
      if (chatWsRef.current?.readyState === WebSocket.OPEN) {
        chatWsRef.current.close();
      }
    };
  }, [isStreamStarted, videoDetails]);

  // set stream started or not flag
  useEffect(() => {
    if (
      videoDetails &&
      videoDetails?.id &&
      videoDetails?.status === CONTENT_STATUS.LIVE
    ) {
      setIsStreamStarted(true);
    }
  }, [videoDetails]);

  // calculate video width and height
  useEffect(() => {
    const calculateVideoDimensions = () => {
      const containerWidth = window.innerWidth;

      if (isMobile) {
        const width = containerWidth - 50;
        const height = (width * 9) / 16; // Maintain 16:9 aspect ratio
        setVideoDimensions({ width, height });
      } else {
        const containerHeight = window.innerHeight;
        const chatWidth = isChatVisible ? containerWidth / 4 : 0;
        const availableWidth = containerWidth - chatWidth - 120; // padding and offsets
        const availableHeight = containerHeight - 140; // padding and offsets

        setVideoDimensions({
          width: availableWidth,
          height: availableHeight,
        });
      }
    };

    // Calculate dimensions on mount, chat visibility toggle, or window resize
    calculateVideoDimensions();
    window.addEventListener('resize', calculateVideoDimensions);

    return () => {
      window.removeEventListener('resize', calculateVideoDimensions);
    };
  }, [isChatVisible, isMobile]);

  // Modal dialogs
  const openNotifyModal = (
    type: NotifyModalType,
    title: string,
    description: string | JSX.Element,
    onClose?: () => void
  ): void => {
    setNotifyModal({
      type,
      title,
      description,
      isOpen: true,
      onClose,
    });
  };
  const closeNotifyModal = (): void => {
    if (notifyModal.onClose) {
      notifyModal.onClose();
    }

    setNotifyModal({
      type: NotifyModalType.SUCCESS,
      title: '',
      description: '',
      isOpen: false,
      onClose: undefined,
    });
  };

  if (isFetching) return <FullscreenLoading />;

  return (
    <AppLayout>
      <div className="flex flex-col w-full h-full gap-3 overflow-hidden box-border">
        <div className="flex w-full lg:h-full items-center justify-center overflow-hidden">
          {/* Video and Chat Layout */}
          <div className="flex flex-col lg:flex-row w-full h-full gap-3">
            {/* Webcam View */}
            <div className="flex-1 flex items-center justify-center border rounded-md overflow-hidden relative">
              {/* Live indicators */}
              {isStreamStarted && (
                <div className="absolute top-3 left-3 z-20">
                  <LiveIndicator
                    isStreamStarted
                    startedAt={videoDetails?.started_at}
                    likeCount={
                      liveInitialStats.like_count ||
                      videoDetails?.likes?.total ||
                      0
                    }
                    commentCount={
                      liveInitialStats.comments?.length ||
                      videoDetails?.comments ||
                      0
                    }
                    viewerCount={liveViewersCount || videoDetails?.views || 0}
                  />
                </div>
              )}
              {/* video */}
              <div
                style={{
                  width: `${videoDimensions.width}px`,
                  height: `${videoDimensions.height}px`,
                }}
              >
                <VideoPlayerFLV
                  url={videoDetails?.broadcast_url}
                  token={retrieveAuthToken() || ''}
                  poster="your-thumbnail-url.jpg"
                  videoWidth={videoDimensions.width}
                  videoHeight={videoDimensions.height}
                />
              </div>
            </div>

            {/* Chat */}
            {isStreamStarted && isChatVisible && (
              <div className="w-full lg:w-1/4 flex flex-col h-[50vh] md:h-full border rounded-md overflow-hidden">
                <Chat
                  currentUser={currentUser}
                  initialStats={liveInitialStats}
                  onToggleVisibility={handleToggleChat}
                  onReactOnLive={handleReactOnLive}
                  onCommentOnLive={handleCommentOnLive}
                />
              </div>
            )}
          </div>
        </div>

        {/* Control bars */}
        <div className="bottom-0 flex items-center md:justify-center mt-3">
          {/* Stream details card */}
          {isStreamStarted && videoDetails?.id && (
            <>
              <div className="hidden md:inline-block absolute left-5">
                <Popover>
                  <PopoverTrigger>
                    <Button variant="ghost" size="sm">
                      <LetterText />
                      Details
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent side="bottom">
                    <StreamDetailsCard
                      data={{
                        id: videoDetails?.id,
                        title: videoDetails?.title,
                        description: videoDetails?.description,
                        thumbnail_url: videoDetails?.thumbnail_url,
                        broadcast_url: videoDetails?.broadcast_url,
                        push_url: null,
                        started_at: videoDetails?.started_at,
                        category_ids: videoDetails?.categories?.map(
                          (category) => category.id
                        ),
                      }}
                      categories={videoDetails?.categories}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {/* Start - Mobile stream details card */}
              {!isChatVisible && isStreamStarted && (
                <div className="block w-full md:hidden">
                  <div className="flex justify-between items-start">
                    <StreamerAvatar />
                    <Button
                      onClick={handleToggleChat}
                      variant="outline"
                      size="sm"
                    >
                      <MessageSquare /> Show Chat
                    </Button>
                  </div>
                  <div className="mt-3 bg-muted p-4 rounded-lg">
                    <p className="text-xl font-semibold">
                      {videoDetails?.title || ''}
                    </p>
                    <p className="text-xs">
                      <span className="text-muted-foreground">
                        Streamed live at
                      </span>{' '}
                      {getFormattedDate(
                        new Date(videoDetails?.started_at || new Date()),
                        true
                      )}
                    </p>

                    <div className="flex gap-2">
                      {videoDetails?.categories?.map((category) => (
                        <Fragment key={category.id}>
                          <VideoCategory
                            id={category.id}
                            label={convertToHashtagStyle(category.name)}
                          />
                        </Fragment>
                      ))}
                    </div>

                    <p className="mt-2">{videoDetails?.description || ''}</p>
                  </div>
                </div>
              )}
              {/* End - Mobile stream details card */}
            </>
          )}

          {/* Chat toggle button */}
          <div className="hidden md:inline-block absolute right-5">
            {isStreamStarted && (
              <Button variant="ghost" size="sm" onClick={handleToggleChat}>
                <MessageSquare /> {isChatVisible ? 'Hide' : 'Show'} chat
              </Button>
            )}
          </div>
        </div>
      </div>

      <NotifyModal
        type={notifyModal.type}
        isOpen={notifyModal.isOpen}
        title={notifyModal.title}
        description={notifyModal.description}
        onClose={closeNotifyModal}
      />
    </AppLayout>
  );
};

export default WatchLive;
