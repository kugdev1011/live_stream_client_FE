import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import flvjs from 'flv.js'; // Import flv.js
import { retrieveAuthToken } from '@/data/model/userAccount';

type PlayerOptions = typeof videojs.options;

interface VideoPlayerProps {
  id?: string;
  videoUrl?: string;
  options?: PlayerOptions;
  isFlv?: boolean; // New prop to check if the video is FLV
  styles?: string;
  videoRequest: {
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setIsBuffered: React.Dispatch<React.SetStateAction<boolean>>;
    setIsError: React.Dispatch<React.SetStateAction<boolean>>;
    setIsSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  };
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  options,
  isFlv = false,
  styles,
  videoRequest,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const flvPlayerRef = useRef<any>(null);

  const { setIsLoading, setIsBuffered, setIsError, setIsSuccess } =
    videoRequest;

  useEffect(() => {
    if (isFlv && videoUrl && flvjs.isSupported()) {
      const videoElement = videoRef.current;
      if (videoElement && !flvPlayerRef.current) {
        const flvPlayer = flvjs.createPlayer(
          {
            type: 'flv',
            url: videoUrl,
          },
          {
            headers: {
              Authorization: `Bearer ${retrieveAuthToken()}`,
            },
          }
        );

        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
        flvPlayer.play();

        flvPlayerRef.current = flvPlayer;

        flvPlayer.on('error', (errorType, errorDetail) => {
          setIsError(true);
          console.error(
            `FLV.js Error - Type: ${errorType}, Detail: ${errorDetail}`
          );
        });

        flvPlayer.on('loadstart', () => setIsLoading(true));
        flvPlayer.on('loadend', () => setIsLoading(false));
      }
    } else if (!isFlv && options?.sources.length > 0 && videoRef.current) {
      // Initialize video.js player if not FLV
      if (!playerRef.current) {
        const player = videojs(videoRef.current, options, () => {
          console.log('Video player is ready');
        });

        playerRef.current = player;

        player.on('error', () => setIsError(true));

        player.on('loadedmetadata', () => {
          setIsSuccess(true);
          setIsLoading(false);
        });

        player.on('playing', () => {
          setIsBuffered(true);
          setIsError(false);
        });
      } else {
        const currentSrc = playerRef.current.currentSrc();
        const newSrc = options.sources[0].src;
        const player = playerRef.current;

        if (currentSrc !== newSrc) {
          player.autoplay(options.autoplay);
          player.src(options.sources);
        }
      }
    }

    return () => {
      if (flvPlayerRef.current) {
        flvPlayerRef.current.destroy();
      }
    };
  }, [
    videoUrl,
    options,
    isFlv,
    setIsLoading,
    setIsBuffered,
    setIsError,
    setIsSuccess,
  ]);

  return (
    <div className={styles}>
      <video
        ref={videoRef}
        className="video-js vjs-theme-city vjs-big-play-centered"
        style={{ width: '100%', height: '100%' }}
      ></video>
    </div>
  );
};

export default VideoPlayer;
