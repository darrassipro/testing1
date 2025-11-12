"use client"
import React from 'react';
import { useTranslations } from 'next-intl';
import { mockFeatures } from '@/lib/constants/features';
import FeatureIcon from './FeatureIcon';

export default function FeaturesSection() {
    const t = useTranslations();
    
    // NOTE: The 'client\public' path should translate to the root '/' path in the browser context.
    const backgroundImageStyle = {
        backgroundImage: `url('/images/zlij.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Makes the background stable while scrolling content over it
    };

    return (
      
        <div 
            className="py-12 md:py-20 bg-white"
            style={backgroundImageStyle}
        > 
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 md:mb-16">
                    <h2 className="text-3xl md:text-[40px] font-semibold mb-2 text-black leading-tight">
                        {t('featuresSection.title')}
                    </h2>
                    <p className="text-[#6A6A6A] text-base md:text-[22.5px] leading-relaxed">
                        {t('featuresSection.subtitle')}
                    </p>
                </div>
                {/* Grid layout for the four features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4"> 
                    {mockFeatures.map((feature, index) => {
                        // Only top-right and bottom-left corners rounded
                        // Tailwind: rounded-tr-[40px] rounded-bl-[40px]
                        // Remove other rounded classes
                        return (
                            <div
                                key={index}
                                className="bg-white/90 border border-[rgba(0,112,54,0.15)] rounded-tr-[40px] rounded-bl-[40px] p-6 md:p-7 text-center hover:shadow-lg transition-shadow"
                            >
                                {/* Icon Container */}
                                <div className="mx-auto mb-8 md:mb-10 flex justify-center">
                                    <FeatureIcon icon={feature.icon} color={feature.color} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-semibold mb-3 text-black">
                                    {t(feature.titleKey)}
                                </h3>
                                <p className="text-black text-base md:text-xl leading-relaxed">
                                    {t(feature.descriptionKey)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}