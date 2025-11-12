"use client";
import React from 'react';

interface FeatureIconProps {
    icon: string;
    color: string;
}

export default function FeatureIcon({ icon }: FeatureIconProps) {
    const iconMap: Record<string, React.ReactElement> = {
        route: (
            <img 
                src="/images/InteractiveRoutes.png" 
                alt="Interactive Routes" 
                // Using w-10/h-10 to make the icon size more prominent, similar to the image
                className="w-10 h-10 md:w-12 md:h-12 object-contain" 
            />
        ),
        audio: (
            <img 
                src="/images/Audio&360° Guides.png" 
                alt="Audio & 360° Guides" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain" 
            />
        ),
        key: (
            <img 
                src="/images/Play&Earn Rewards.png" 
                alt="Play & Earn Rewards" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain" 
            />
        ),
        offline: (
            <img 
                src="/images/Offline Access.png" 
                alt="Offline Access" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain" 
            />
        ),
    };

   
    return (
        <div className="flex items-center justify-center">
            {iconMap[icon]}
        </div>
    );
}