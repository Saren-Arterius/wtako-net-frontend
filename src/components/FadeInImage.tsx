'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

export default function FadeInImage({
  ...imageProps
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      {...imageProps}
      onLoad={() => setIsLoaded(true)}
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        display: 'block',
        ...(imageProps.style || {})
      }}
    />
  );
}
