'use client';

import { useState, useRef } from 'react';
import { Video, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface VideoPreviewProps {
  src?: string;
  poster?: string;
  alt?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
}

// Cloudinary video loader with transformations
const cloudinaryVideoLoader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width?: number;
  quality?: number;
}) => {
  if (!src) return '';

  // If src is already a full Cloudinary URL, append transformations
  if (src.startsWith('https://res.cloudinary.com/')) {
    const parts = src.split('/upload/');
    if (parts.length === 2) {
      const [base, rest] = parts;
      const params = [
        'f_auto',
        'c_limit',
        width ? `w_${width}` : '',
        `q_${quality || 'auto'}`,
        'vc_auto', // video codec auto
      ].filter(Boolean);

      return `${base}/upload/${params.join(',')}/${rest}`;
    }
    return src;
  }

  // For public IDs only
  const params = [
    'f_auto',
    'c_limit',
    width ? `w_${width}` : '',
    `q_${quality || 'auto'}`,
    'vc_auto',
  ].filter(Boolean);

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${params.join(',')}/${src}`;
};

// Cloudinary poster image loader
const cloudinaryPosterLoader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width?: number;
  quality?: number;
}) => {
  if (!src) return '';

  // Extract video public ID and generate poster from video
  let videoPublicId = src;
  
  if (src.startsWith('https://res.cloudinary.com/')) {
    const parts = src.split('/upload/');
    if (parts.length === 2) {
      videoPublicId = parts[1].replace(/\.(mp4|mov|avi|webm)$/, '');
    }
  }

  const params = [
    'f_jpg',
    'c_limit',
    width ? `w_${width}` : 'w_800',
    `q_${quality || 'auto'}`,
    'so_0', // frame at 0 seconds
  ].filter(Boolean);

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/${params.join(',')}/${videoPublicId}.jpg`;
};

export default function VideoPreview({
  src,
  poster,
  alt = 'Video',
  className = 'w-full h-48',
  autoPlay = false,
  muted = false,
  controls = true,
}: VideoPreviewProps) {
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!src || error) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center rounded-lg`}>
        <Video className="w-12 h-12 text-gray-400" />
      </div>
    );
  }

  // Generate optimized video URL
  const optimizedVideoSrc = cloudinaryVideoLoader({ src, width: 1920, quality: 80 });
  
  // Generate poster from video or use provided poster
  const posterSrc = poster 
    ? (poster.startsWith('https://res.cloudinary.com/') 
        ? poster 
        : `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${poster}`)
    : cloudinaryPosterLoader({ src, width: 800, quality: 80 });

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div 
      className={`${className} relative rounded-lg overflow-hidden bg-gray-900 group`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={optimizedVideoSrc}
        poster={posterSrc}
        className="w-full h-full object-cover"
        autoPlay={autoPlay}
        muted={muted}
        loop={false}
        playsInline
        onError={() => setError(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        controls={controls}
      >
        <source src={optimizedVideoSrc} type="video/mp4" />
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>

      {/* Custom Controls Overlay (when controls=false) */}
      {!controls && (
        <>
          {/* Play/Pause Overlay */}
          {(!isPlaying || showControls) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 transition-opacity">
              <button
                onClick={togglePlay}
                className="p-4 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all transform hover:scale-110"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-gray-900" />
                ) : (
                  <Play className="w-8 h-8 text-gray-900 ml-1" />
                )}
              </button>
            </div>
          )}

          {/* Bottom Controls Bar */}
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <div className="flex items-center justify-between">
                <button
                  onClick={togglePlay}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Video Label */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center gap-1 opacity-90">
        <Video className="w-3 h-3" />
        Vidéo
      </div>
    </div>
  );
}