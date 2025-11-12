// client/components/pois/AudioPlayer.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Headphones } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AudioPlayerProps {
	frAudioUrl?: string | null;
	arAudioUrl?: string | null;
	enAudioUrl?: string | null;
}

type AudioLang = 'fr' | 'ar' | 'en';

const AudioPlayer: React.FC<AudioPlayerProps> = ({
	frAudioUrl,
	arAudioUrl,
	enAudioUrl,
}) => {
	const t = useTranslations('AudioPlayer');
	const audioRef = useRef<HTMLAudioElement>(null);

	// Trouver les langues disponibles
	const availableLangs: AudioLang[] = [];
	if (frAudioUrl) availableLangs.push('fr');
	if (arAudioUrl) availableLangs.push('ar');
	if (enAudioUrl) availableLangs.push('en');

	// États du lecteur
	const [selectedLang, setSelectedLang] = useState<AudioLang | null>(
		availableLangs[0] || null
	);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);

	// Fonction pour formater le temps (ex: 01:30)
	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes.toString().padStart(2, '0')}:${seconds
			.toString()
			.padStart(2, '0')}`;
	};

	// Effet pour changer la source audio quand la langue change
	useEffect(() => {
		if (audioRef.current && selectedLang) {
			let url;
			if (selectedLang === 'fr') url = frAudioUrl;
			if (selectedLang === 'ar') url = arAudioUrl;
			if (selectedLang === 'en') url = enAudioUrl;

			if (url) {
				audioRef.current.src = url;
				setIsPlaying(false);
				setCurrentTime(0);
				audioRef.current.load();
			}
		}
	}, [selectedLang, frAudioUrl, arAudioUrl, enAudioUrl]);

	// Gérer Play/Pause
	const togglePlayPause = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play();
			}
			setIsPlaying(!isPlaying);
		}
	};

	// Gérer le Mute/Unmute
	const toggleMute = () => {
		if (audioRef.current) {
			audioRef.current.muted = !isMuted;
			setIsMuted(!isMuted);
		}
	};

	// Gérer le changement de temps via le slider
	const handleSliderChange = (value: number[]) => {
		if (audioRef.current) {
			const newTime = value[0];
			audioRef.current.currentTime = newTime;
			setCurrentTime(newTime);
		}
	};

	if (availableLangs.length === 0) {
		return null; // Ne rien afficher si aucun audio n'est disponible
	}

	return (
		<div className="rounded-lg border bg-white p-4 shadow-sm">
			<audio
				ref={audioRef}
				onLoadedMetadata={() =>
					setDuration(audioRef.current?.duration || 0)
				}
				onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
				onEnded={() => setIsPlaying(false)}
			/>

			<div className="mb-3 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Headphones className="h-5 w-5 text-blue-600" />
					<h4 className="font-semibold">{t('title')}</h4>
				</div>
				{/* Sélecteur de langue */}
				<div className="flex gap-2">
					{availableLangs.map((lang) => (
						<Button
							key={lang}
							variant={selectedLang === lang ? 'default' : 'outline'}
							size="sm"
							onClick={() => setSelectedLang(lang)}
						>
							{lang.toUpperCase()}
						</Button>
					))}
				</div>
			</div>

			<div className="flex items-center gap-3">
				{/* Bouton Play/Pause */}
				<Button size="icon" variant="ghost" onClick={togglePlayPause}>
					{isPlaying ? (
						<Pause className="h-5 w-5" />
					) : (
						<Play className="h-5 w-5" />
					)}
				</Button>

				{/* Time Display */}
				<span className="w-10 text-xs font-medium text-gray-600">
					{formatTime(currentTime)}
				</span>

				{/* Barre de progression */}
				<Slider
					value={[currentTime]}
					max={duration || 0}
					step={1}
					onValueChange={handleSliderChange}
					className="flex-1"
				/>

				{/* Time Display */}
				<span className="w-10 text-xs font-medium text-gray-600">
					{formatTime(duration)}
				</span>

				{/* Bouton Mute */}
				<Button size="icon" variant="ghost" onClick={toggleMute}>
					{isMuted ? (
						<VolumeX className="h-5 w-5" />
					) : (
						<Volume2 className="h-5 w-5" />
					)}
				</Button>
			</div>
		</div>
	);
};

export default AudioPlayer;