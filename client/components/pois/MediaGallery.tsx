'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { POIFile } from '@/lib/types';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';
import { PlayCircle, Eye } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from '@/lib/utils';

interface MediaGalleryProps {
  files?: POIFile[];
  poiName: string;
}

export default function MediaGallery({ files = [], poiName }: MediaGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const images = files.filter(f => f.type === 'image' || f.type === 'imageAlbum');
  const videoFile = files.find(f => f.type === 'video');
  const virtualTourFile = files.find(f => f.type === 'virtualtour');

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleThumbnailClick = (index: number) => {
    api?.scrollTo(index);
  };

  const displayImages = images.length > 0 
    ? images 
    : [{ id: 'fallback', fileUrl: '/images/hero.jpg', type: 'image' as const }];

  return (
    <div className="w-full space-y-4">
      {/* Main Grid - Height fixed to 500px for Desktop */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 h-[300px] lg:h-[500px]">
        
        {/* LEFT: Main Carousel */}
        <div className="relative overflow-hidden rounded-xl shadow-md bg-gray-100 lg:col-span-3 h-full w-full">
          <Carousel 
            setApi={setApi} 
            className="h-full w-full [&>div]:h-full" // Forces Shadcn viewport to be 100% height
            opts={{ align: "start", loop: true }}
          >
            <CarouselContent className="-ml-0 h-full">
              {displayImages.map((img, index) => (
                <CarouselItem key={img.id || index} className="pl-0 basis-full h-full">
                  <div className="relative h-full w-full bg-black/5">
                    <Image
                      loader={cloudinaryLoader}
                      src={img.fileUrl}
                      alt={`${poiName} ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      // FIX 1: Add sizes to remove warning
                      sizes="(max-width: 1024px) 100vw, 75vw"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Arrows */}
            {displayImages.length > 1 && (
                <>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <CarouselPrevious className="relative left-0 translate-y-0 h-10 w-10 border-none bg-black/40 text-white hover:bg-black/60" />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                        <CarouselNext className="relative right-0 translate-y-0 h-10 w-10 border-none bg-black/40 text-white hover:bg-black/60" />
                    </div>
                </>
            )}

            {/* Media Buttons */}
            <div className="absolute bottom-4 right-4 flex gap-2 z-20">
               {videoFile && (
                 <Dialog>
                   <DialogTrigger asChild>
                     <Button size="sm" variant="secondary" className="gap-2 shadow-lg bg-white/90 hover:bg-white">
                       <PlayCircle className="h-4 w-4 text-blue-600" />
                       <span className="hidden sm:inline">Vidéo</span>
                     </Button>
                   </DialogTrigger>
                   <DialogContent className="max-w-4xl p-0 border-none bg-black">
                     <DialogHeader className="sr-only"><DialogTitle>Video</DialogTitle></DialogHeader>
                     <AspectRatio ratio={16 / 9}>
                       <video src={videoFile.fileUrl} controls autoPlay className="h-full w-full" />
                     </AspectRatio>
                   </DialogContent>
                 </Dialog>
               )}

               {virtualTourFile && (
                 <Dialog>
                   <DialogTrigger asChild>
                     <Button size="sm" variant="secondary" className="gap-2 shadow-lg bg-white/90 hover:bg-white">
                       <Eye className="h-4 w-4 text-green-600" />
                       <span className="hidden sm:inline">360°</span>
                     </Button>
                   </DialogTrigger>
                   <DialogContent className="max-w-4xl p-0 border-none bg-black">
                     <DialogHeader className="sr-only"><DialogTitle>360 Tour</DialogTitle></DialogHeader>
                     <AspectRatio ratio={16 / 9}>
                       <iframe src={virtualTourFile.fileUrl} className="h-full w-full border-0" allowFullScreen />
                     </AspectRatio>
                   </DialogContent>
                 </Dialog>
               )}
            </div>
            
            <div className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white lg:hidden">
               {current} / {count}
            </div>
          </Carousel>
        </div>

        {/* RIGHT: Thumbnails */}
        <div className="hidden lg:block lg:col-span-1 h-full">
           <div className="flex h-full flex-col gap-2">
              <h3 className="text-sm font-semibold text-gray-500 px-1">
                Galerie ({displayImages.length})
              </h3>
              <ScrollArea className="flex-1 rounded-xl border bg-gray-50 p-2">
                  <div className="flex flex-col gap-3">
                    {displayImages.map((img, index) => (
                        <button
                            key={img.id || index}
                            onClick={() => handleThumbnailClick(index)}
                            className={cn(
                                "relative aspect-[4/3] w-full overflow-hidden rounded-lg border-2 transition-all",
                                // FIX 2: Removed opacity-60 to remove 'blur' effect
                                current === index + 1 
                                    ? "border-blue-600 ring-2 ring-blue-600/20" 
                                    : "border-transparent hover:border-gray-300"
                            )}
                        >
                            <Image
                                loader={cloudinaryLoader}
                                src={img.fileUrl}
                                alt={`Thumbnail ${index}`}
                                fill
                                className="object-cover"
                                // FIX 1: Add sizes to remove warning
                                sizes="(max-width: 1024px) 25vw, 20vw"
                            />
                        </button>
                    ))}
                  </div>
              </ScrollArea>
           </div>
        </div>

        {/* MOBILE Queue */}
        <div className="block lg:hidden mt-2">
            <ScrollArea className="w-full whitespace-nowrap pb-2">
                <div className="flex gap-2">
                    {displayImages.map((img, index) => (
                        <button
                            key={img.id || index}
                            onClick={() => handleThumbnailClick(index)}
                            className={cn(
                                "relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2",
                                current === index + 1 ? "border-blue-600" : "border-transparent"
                            )}
                        >
                            <Image
                                loader={cloudinaryLoader}
                                src={img.fileUrl}
                                alt="Thumbnail"
                                fill
                                className="object-cover"
                                sizes="100px"
                            />
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>
      </div>
    </div>
  );
}