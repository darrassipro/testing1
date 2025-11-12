'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { cloudinaryLoader } from '../../../utils/cloudenary-loader';

interface ImagePreviewProps {
  src?: string;
  alt: string;
  className?: string;
}

export default function ImagePreview({ src, alt, className = "w-full h-48" }: ImagePreviewProps) {
  const [error, setError] = useState(false);
  
  if (!src || error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center rounded-lg`}>
        <ImageIcon className="w-12 h-12 text-gray-400" />
      </div>
    );
  }
  
  return (
    <div className={`${className} relative rounded-lg overflow-hidden bg-gray-100`}>
      <Image
        loader={cloudinaryLoader}
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setError(true)}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}