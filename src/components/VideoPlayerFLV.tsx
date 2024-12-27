import React, { useEffect, useRef } from 'react';
import flvjs from 'flv.js';
import 'video.js/dist/video-js.css';
import { retrieveAuthToken } from '@/data/model/userAccount';

interface VideoPlayerFLVProps {
  videoUrl: string;
  styles?: string;
}

const VideoPlayerFLV: React.FC<VideoPlayerFLVProps> = ({
  videoUrl,
  styles,
}: VideoPlayerFLVProps) => {
  const token = retrieveAuthToken();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const flvPlayerRef = useRef<flvjs.Player | null>(null);

  useEffect(() => {
    if (flvjs.isSupported() && videoUrl && videoRef.current) {
      const videoElement = videoRef.current;

      if (!flvPlayerRef.current) {
        const flvPlayer = flvjs.createPlayer(
          {
            type: 'flv',
            url: videoUrl,
            cors: true,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
        flvPlayer.play();

        flvPlayerRef.current = flvPlayer;

        flvPlayer.on(flvjs.Events.ERROR, (errorType, errorDetail) => {
          console.error(
            `FLV.js Error - Type: ${errorType}, Detail: ${errorDetail}`
          );
        });
      }
    } else {
      alert('Your browser does not support FLV playback.');
    }

    return () => {
      if (flvPlayerRef.current) {
        flvPlayerRef.current.destroy();
      }
    };
  }, [videoUrl, token]);

  return (
    <div className={styles}>
      <video
        ref={videoRef}
        className="video-js vjs-theme-city vjs-big-play-centered"
        style={{ width: '100%', height: 'auto' }}
        controls
      ></video>
    </div>
  );
};

export default VideoPlayerFLV;
