// client/components/pois/MediaGallery.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { POIFile } from '@/lib/types';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';
import { PlayCircle, Eye } from 'lucide-react';

// Assumant que vous avez shadcn/ui Dialog et AspectRatio
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';

interface MediaGalleryProps {
	poiFile: POIFile | null;
	poiName: string;
}

type ModalContentType = 'video' | '360' | null;

const MediaGallery: React.FC<MediaGalleryProps> = ({ poiFile, poiName }) => {
	const [modalContent, setModalContent] =
		useState<ModalContentType>(null);

    const imageUrl = poiFile?.type === 'image' ? poiFile.fileUrl : '/images/hero.jpg';
    const videoUrl = poiFile?.type === 'video' ? poiFile.fileUrl : undefined;
    const virtualTourUrl = poiFile?.type === 'virtualtour' ? poiFile.fileUrl : undefined;

	const renderModalContent = () => {
		switch (modalContent) {
			case 'video':
				return (
					<>
						<DialogHeader>
							<DialogTitle>Vidéo: {poiName}</DialogTitle>
						</DialogHeader>
						<AspectRatio ratio={16 / 9}>
							<video
								src={videoUrl}
								controls
								autoPlay
								className="h-full w-full rounded-lg"
							>
								Votre navigateur ne supporte pas la balise vidéo.
							</video>
						</AspectRatio>
					</>
				);
			case '360':
				return (
					<>
						<DialogHeader>
							<DialogTitle>Visite 360°: {poiName}</DialogTitle>
						</DialogHeader>
						<AspectRatio ratio={16 / 9}>
							{/* Pour le moment, nous utilisons un iframe.
                Nous remplacerons cela par Pannellum.js plus tard.
              */}
							<iframe
								src={virtualTourUrl}
								className="h-full w-full rounded-lg"
								allowFullScreen
							/>
						</AspectRatio>
					</>
				);
			default:
				return null;
		}
	};

	return (
		<div className="overflow-hidden rounded-xl shadow-lg">
			<Dialog
				open={!!modalContent}
				onOpenChange={(isOpen) => !isOpen && setModalContent(null)}
			>
				<div className="relative">
					{/* Image Principale */}
					<AspectRatio ratio={16 / 9}>
						<Image
							loader={cloudinaryLoader}
							src={imageUrl}
							alt={poiName}
							layout="fill"
							objectFit="cover"
							priority // Charger l'image principale en priorité
						/>
					</AspectRatio>

					{/* Boutons Média Superposés */}
					<div className="absolute bottom-4 right-4 flex gap-3">
						{videoUrl && (
							<DialogTrigger asChild>
								<Button
									variant="secondary"
									className="gap-2"
									onClick={() => setModalContent('video')}
									aria-label="Lancer la vidéo"
								>
									<PlayCircle className="h-5 w-5" />
									Vidéo
								</Button>
							</DialogTrigger>
						)}
						{virtualTourUrl && (
							<DialogTrigger asChild>
								<Button
									variant="secondary"
									className="gap-2"
									onClick={() => setModalContent('360')}
									aria-label="Lancer la visite 360"
								>
									<Eye className="h-5 w-5" />
									360°
								</Button>
							</DialogTrigger>
						)}
					</div>
				</div>

				<DialogContent className="max-w-3xl">
					{renderModalContent()}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default MediaGallery;