import React, { useEffect, useState } from 'react';
import DefaultImg from '@/assets/images/video-thumbnail.jpg';
import { fetchImageWithAuth } from '@/api/image';

interface AuthImageProps {
  src: string;
  alt: string;
  className?: string;
}

const AuthImage: React.FC<AuthImageProps> = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const blobUrl = await fetchImageWithAuth(src);
        setImageSrc(blobUrl);
      } catch (e) {
        console.error('Image fetch failed:', e);
        setError(true);
      }
    };

    loadImage();
  }, [src]);

  return (
    <img
      src={error ? DefaultImg : imageSrc || DefaultImg}
      alt={alt}
      className={className}
    />
  );
};

export default AuthImage;
