import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/AppLayout';
import LayoutHeading from '@/layouts/LayoutHeading';
import { LetterText, MessageSquare } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import DetailsForm from './DetailsForm';
import { useNavigate } from 'react-router-dom';
import { LIVE_STREAM_PATH } from '@/data/route';
import { retrieveAuthToken } from '@/data/model/userAccount';
import {
  NotificationModalProps,
  NotifyModal,
} from '@/components/NotificationModal';
import {
  ConfirmationModalProps,
  ConfirmModal,
} from '@/components/ConfirmationModal';
import { NotifyModalType } from '@/components/UITypes';
import { modalTexts } from '@/data/stream';
import LiveIndicator from './LiveIndicator';
import ResourcePermissionDeniedOverlay from './ResourcePermissionDeniedOverlay';
import { StreamDetailsResponse } from '@/data/dto/stream';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import StreamDetailsCard from './StreamDetailsCard';
import {
  LiveInteractionType,
  LiveInitialStatsResponse,
  LiveReactionRequest,
  LiveReactionResponse,
  LiveCommentRequest,
  isLiveCommentInfoObj,
  LiveCommentInfo,
} from '@/data/dto/chat';
import { OnReactOnLiveParams } from '@/components/Chat/Reactions';
import _ from 'lodash';
import useUserAccount from '@/hooks/useUserAccount';
import ControlButtons from './ControlButtons';
import StreamerAvatar from '@/components/StreamerAvatar';
import { getFormattedDate } from '@/lib/date-time';
import Chat from '@/components/Chat';
import { useIsMobile } from '@/hooks/useMobile';
import { fetchCategories } from '@/services/category';
import { CategoryResponse } from '@/data/dto/category';
import { getObjectsByIds, toHashtagStyle } from '@/lib/utils';

const title = 'Go Live';

const LiveStreamWebcam = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const currentUser = useUserAccount();

  const streamWsRef = useRef<WebSocket | null>(null);
  const chatWsRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isResourcePermissionDenied, setIsResourcePermissionDenied] =
    useState(false);
  const [videoDimensions, setVideoDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [streamCategories, setStreamCategories] = useState<CategoryResponse[]>(
    []
  );
  const [isStreamStarted, setIsStreamStarted] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true); // Default to mic on
  const [isStreamInitializeModelOpen, setIsStreamInitializeModalOpen] =
    useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [streamDetails, setStreamDetails] = useState<StreamDetailsResponse>({
    id: null,
    title: null,
    description: null,
    thumbnail_url: null,
    push_url: null,
    broadcast_url: null,
    category_ids: [],
    started_at: null,
  });
  const [liveViewersCount, setLiveViewersCount] = useState(0);
  const [liveInitialStats, setLiveInitialStats] =
    useState<LiveInitialStatsResponse>({
      type: LiveInteractionType.INITIAL,
      comments: [],
      like_count: 0,
      like_info: {},
      current_like_type: undefined,
    });
  const [notifyModal, setNotifyModal] = useState<NotificationModalProps>({
    type: NotifyModalType.SUCCESS,
    isOpen: false,
    title: '',
    description: '',
  });
  const [confirmModal, setConfirmModal] = useState<ConfirmationModalProps>({
    isDanger: false,
    isOpen: false,
    title: '',
    description: '',
    proceedBtnText: '',
    onConfirm: () => {},
    onCancel: () => {},
  });

  // Toggles chat visibility
  const handleToggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  // Toggles the microphone on or off for the current video stream.
  const handleToggleMic = () => {
    if (videoRef.current) {
      const mediaStream = videoRef.current.srcObject as MediaStream;
      if (mediaStream) {
        const audioTrack = mediaStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
          setIsMicOn(audioTrack.enabled);
        }
      }
    }
  };

  // Toggles stream initialize modal to start a stream. Without this step, can't stream.
  const handleInitializeStreamModalToggle = (): void => {
    setIsStreamInitializeModalOpen(!isStreamInitializeModelOpen);
  };

  // Shows success modal after submitting stream initialization steps
  const handleInitializeStreamSuccess = (data: StreamDetailsResponse): void => {
    if (data.id) {
      const {
        id,
        title,
        description,
        thumbnail_url,
        push_url,
        broadcast_url,
        category_ids,
      } = data;

      setIsStreamStarted(true);
      if (!isMobile) setIsChatVisible(true);
      setIsStreamInitializeModalOpen(false);

      setStreamDetails({
        id,
        title,
        description,
        thumbnail_url,
        push_url,
        broadcast_url,
        category_ids,
        started_at: null,
      });

      openNotifyModal(
        NotifyModalType.SUCCESS,
        modalTexts.stream.successStart.title,
        modalTexts.stream.successStart.description
      );

      startStreaming(data.id);
    }
  };

  // Cancels streaming. Stops using webcam and audio.
  const handleInitializeStreamCancel = (): void => {
    stopWebcamAndAudio();
    navigate(LIVE_STREAM_PATH);
  };

  // Starts stream using websocket
  const startStreaming = (id: number) => {
    if (!videoRef.current) return;

    const video = videoRef.current as HTMLVideoElement & {
      captureStream(): MediaStream;
    };

    const token = retrieveAuthToken();
    if (!token) {
      console.error('Error: JWT token not found in localStorage');
      return;
    }

    // Open WebSocket connection with token as a query parameter
    const wsURL = import.meta.env.VITE_WS_STREAM_URL;
    const streamWs = new WebSocket(
      `${wsURL}/${id}?token=${encodeURIComponent(token)}`
    );

    streamWsRef.current = streamWs;

    streamWs.onopen = () => {
      setIsStreamStarted(true);
      console.log('WebSocket connection established');

      // Start sending video frames
      const stream = video.captureStream();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp8',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          streamWs.send(event.data);
        }
      };

      mediaRecorder.start(100); // Send data every 100ms

      streamWs.onclose = () => {
        console.log('WebSocket connection closed');
        mediaRecorder.stop();
        setIsStreamStarted(false);
        setIsChatVisible(false);
      };

      streamWs.onerror = (err) => {
        console.error('WebSocket error:', err);
        mediaRecorder.stop();
        setIsStreamStarted(false);
        setIsChatVisible(false);
      };
    };

    streamWs.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response && response?.started_at) {
          setStreamDetails((prevStats) => {
            const updatedStats = { ...prevStats };
            updatedStats.started_at = response.started_at;
            return updatedStats;
          });
        }
      } catch (error) {
        console.error('Error parsing Stream WebSocket message:', error);
      }
    };
  };

  // Shows confirm modal to end stream
  const handleEndStream = () => {
    openConfirmModal(
      modalTexts.stream.confirmToEnd.title,
      modalTexts.stream.confirmToEnd.description,
      () => handleEndStreamConfirmed(),
      true,
      'Confirm to End'
    );
  };

  // Ends stream, terminates ws connection, stops using webcam & mic
  const handleEndStreamConfirmed = () => {
    setIsStreamStarted(false);

    // End websocket
    if (streamWsRef.current) {
      streamWsRef.current.close();
      streamWsRef.current = null;
    }

    stopWebcamAndAudio();

    handleStreamEndSuccess();
  };

  // Shows notify modal
  const handleStreamEndSuccess = () => {
    openNotifyModal(
      NotifyModalType.SUCCESS,
      modalTexts.stream.successEnd.title,
      modalTexts.stream.successEnd.description
    );
    navigate(LIVE_STREAM_PATH);
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

  // 1) Get video metadata for setting dimensions
  const loadVideoMetadata = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      setVideoDimensions({ width: videoWidth, height: videoHeight });
    }
  };

  // 2) Make video scaled based on dimensions
  const getScaledVideoStyle = () => {
    if (!videoDimensions.width || !videoDimensions.height) return {};

    const aspectRatio = videoDimensions.width / videoDimensions.height;
    const containerWidth = videoRef.current?.parentElement?.clientWidth || 0;
    const containerHeight = videoRef.current?.parentElement?.clientHeight || 0;

    // Scale the video width to always take up the full container width
    const scaledWidth = containerWidth;
    const scaledHeight = scaledWidth / aspectRatio;

    // If the scaled height exceeds the container height, limit it
    if (scaledHeight > containerHeight) {
      return {
        width: `${scaledWidth}px`, // scale based on height - containerHeight * aspectRatio
        height: `${containerHeight}px`, // scale based on container height
      };
    }

    return {
      width: `${scaledWidth}px`, // scale based on width
      height: `${scaledHeight}px`, // proportional height
    };
  };

  // 3) Stop using webcam and audio
  const stopWebcamAndAudio = () => {
    if (videoRef.current) {
      const mediaStream = videoRef.current.srcObject as MediaStream;
      if (mediaStream) {
        // Clear the video source
        videoRef.current.srcObject = null;

        // Stop all tracks (audio and video)
        mediaStream.getTracks().forEach((track) => {
          console.log(`Stopping track: ${track.kind}`);
          track.stop();
        });
      }
    }
  };

  // Slose permission denied overlay and go back to index page
  const handleClosePermissionOverlay = () => {
    setIsResourcePermissionDenied(false);
    navigate(LIVE_STREAM_PATH);
  };

  useEffect(() => {
    if (isStreamStarted && streamDetails) {
      const token = retrieveAuthToken();
      if (!token) return;

      const chatWsURL = import.meta.env.VITE_WS_STREAM_URL;
      const chatWs = new WebSocket(
        `${chatWsURL}/${
          streamDetails.id
        }/interaction?token=${encodeURIComponent(token)}`
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

              if (!like_status) return prevStats;

              const updatedStats = { ...prevStats };
              updatedStats.current_like_type = like_type;

              return updatedStats;
            });
          }
          // On removing a reaction
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
          // On commenting
          else if (response && isLiveCommentInfoObj(response)) {
            setLiveInitialStats((prevStats) => {
              const updatedStats = {
                ...prevStats,
                comments: [
                  ...prevStats.comments,
                  response,
                ] as LiveCommentInfo[],
              };
              return updatedStats;
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
                like_count: response?.data?.total || prevStats.like_count,
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

            // TODO: may need to redirect to some page(s)
            openNotifyModal(
              NotifyModalType.ERROR,
              'Live Ended!',
              'Your live has been ended'
            );
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
  }, [isStreamStarted, streamDetails]);

  // Open camera and mic, fetch categories as soon as this page is rendered
  useEffect(() => {
    const startWebcam = async () => {
      try {
        // Request access to the webcam
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsResourcePermissionDenied(false);
      } catch (error) {
        console.error('Error accessing webcam:', error);
        setIsResourcePermissionDenied(true);
      }
    };
    startWebcam();

    const getCategories = async () => {
      const data = await fetchCategories();
      if (data) setStreamCategories(data);
    };
    getCategories();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (streamWsRef.current) {
        streamWsRef.current.close();
      }
    };
  }, []);

  // Modal dialogs
  const openConfirmModal = (
    title: string,
    description: string | JSX.Element,
    onConfirm: () => void,
    isDanger?: boolean,
    proceedBtnText?: string
  ): void => {
    closeNotifyModal();
    setConfirmModal({
      isDanger,
      title,
      description,
      isOpen: true,
      proceedBtnText,
      onConfirm: () => {
        closeConfirmationModal();
        onConfirm();
      },
      onCancel: closeConfirmationModal,
    });
  };
  const closeConfirmationModal = (): void => {
    setConfirmModal({
      isOpen: false,
      title: '',
      description: '',
      onConfirm: () => {},
      onCancel: () => {},
    });
  };
  const openNotifyModal = (
    type: NotifyModalType,
    title: string,
    description: string | JSX.Element
  ): void => {
    closeConfirmationModal();
    setNotifyModal({
      type,
      title,
      description,
      isOpen: true,
    });
  };
  const closeNotifyModal = (): void => {
    setNotifyModal({
      title: '',
      description: '',
      isOpen: false,
    });
  };

  return (
    <AppLayout title={title}>
      <LayoutHeading title={title} />

      {isResourcePermissionDenied ? (
        <ResourcePermissionDeniedOverlay
          onGoBack={handleClosePermissionOverlay}
        />
      ) : (
        <>
          <DetailsForm
            categories={streamCategories?.map((cat) => ({
              id: cat.id.toString(),
              name: cat.name,
            }))}
            isOpen={isStreamInitializeModelOpen}
            onSuccess={handleInitializeStreamSuccess}
            onClose={handleInitializeStreamModalToggle}
          />

          <div className="flex flex-col w-full h-full gap-3 overflow-hidden box-border">
            <div className="flex w-full lg:h-full items-center justify-center overflow-hidden">
              {/* Video and Chat Layout */}
              <div className="flex flex-col lg:flex-row w-full h-full gap-3">
                {/* Webcam View */}
                <div className="flex-1 flex items-center justify-center border rounded-md overflow-hidden relative">
                  {/* Live indicators */}
                  {isStreamStarted && (
                    <div className="absolute top-3 left-3">
                      <LiveIndicator
                        isStreamStarted={isStreamStarted}
                        likeCount={liveInitialStats.like_count}
                        commentCount={liveInitialStats.comments?.length}
                        viewerCount={liveViewersCount}
                      />
                    </div>
                  )}
                  {/* sm: Control buttons */}
                  <div className="absolute bottom-3 z-10 inline md:hidden">
                    <ControlButtons
                      isMicOn={isMicOn}
                      isStreamStarted={isStreamStarted}
                      onToggleMic={handleToggleMic}
                      onEndStream={handleEndStream}
                      onInitializeStreamModalToggle={
                        handleInitializeStreamModalToggle
                      }
                      onInitializeStreamCancel={handleInitializeStreamCancel}
                    />
                  </div>
                  {/* video */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    draggable={false}
                    onLoadedMetadata={loadVideoMetadata}
                    style={getScaledVideoStyle()}
                    className="object-contain lg:max-h-full"
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
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
            <div className="bottom-0 flex items-center md:justify-center">
              {/* Stream details card */}
              {streamDetails && streamDetails?.id && (
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
                          data={streamDetails}
                          categories={streamCategories}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {/* Start - Mobile stream details card */}
                  {!isChatVisible && (
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
                          {streamDetails?.title || 'No Title Was Given'}
                        </p>
                        <p className="text-xs">
                          <span className="text-muted-foreground">
                            Streamed live at
                          </span>{' '}
                          {getFormattedDate(
                            new Date(streamDetails?.started_at || new Date()),
                            true
                          )}
                        </p>
                        <p className="text-blue-400">
                          {getObjectsByIds(
                            streamCategories,
                            streamDetails?.category_ids || [],
                            'id'
                          ).map((category) => {
                            return toHashtagStyle(category.name) + ' ';
                          })}
                        </p>
                        <p className="mt-2">
                          {streamDetails?.description ||
                            'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Alias, eligendi veniam a, ut fuga consequatur optio voluptas reiciendis, debitis unde harum! Soluta, amet voluptatibus fugit perspiciatis maxime exercitationem ipsam quisquam.'}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* End - Mobile stream details card */}
                </>
              )}

              {/* md: Control buttons */}
              <div className="hidden md:inline-block">
                <ControlButtons
                  isMicOn={isMicOn}
                  isStreamStarted={isStreamStarted}
                  onToggleMic={handleToggleMic}
                  onEndStream={handleEndStream}
                  onInitializeStreamModalToggle={
                    handleInitializeStreamModalToggle
                  }
                  onInitializeStreamCancel={handleInitializeStreamCancel}
                />
              </div>
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
        </>
      )}

      <NotifyModal
        type={notifyModal.type}
        isOpen={notifyModal.isOpen}
        title={notifyModal.title}
        description={notifyModal.description}
        onClose={closeNotifyModal}
      />
      <ConfirmModal
        isDanger={confirmModal.isDanger}
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        proceedBtnText={confirmModal.proceedBtnText}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmationModal}
      />
    </AppLayout>
  );
};

export default LiveStreamWebcam;
