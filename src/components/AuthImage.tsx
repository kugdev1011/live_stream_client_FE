import React, { useEffect, useState } from 'react';
import DefaultImg from '@/assets/images/video-thumbnail.jpg';
import { fetchImageWithAuth } from '@/api/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarFallbackText } from '@/lib/utils';

interface AuthImageProps {
  src: string;
  alt: string;
  type: 'image' | 'avatar';
  isLive?: boolean;
  displayText?: string;
  className?: string;
}

const AuthImage = React.forwardRef<HTMLElement, AuthImageProps>(
  ({ src, alt, type, displayText, isLive = false, className }, ref) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
      const loadImage = async () => {
        if (src) {
          try {
            const blobUrl = await fetchImageWithAuth(src);
            setImageSrc(blobUrl);
          } catch (e) {
            console.error('Image fetch failed:', e);
            setError(true);
          }
        }
      };

      loadImage();
    }, [src]);

    if (type === 'avatar') {
      return (
        <Avatar
          ref={ref as React.Ref<HTMLDivElement>}
          className={`cursor-pointer w-10 h-10 ${
            isLive ? 'border-red-500 border-2' : ''
          } ${className}`}
        >
          <AvatarImage
            src={error ? '' : imageSrc || src}
            className="object-cover"
          />
          <AvatarFallback className="text-xs">
            {getAvatarFallbackText(displayText || 'NA')}
          </AvatarFallback>
        </Avatar>
      );
    }

    return (
      <img
        ref={ref as React.Ref<HTMLImageElement>}
        src={error ? DefaultImg : imageSrc || DefaultImg}
        alt={alt}
        className={className}
      />
    );
  }
);

AuthImage.displayName = 'AuthImage';

export default AuthImage;
