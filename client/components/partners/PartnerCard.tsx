// client/components/partners/PartnerCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Partner } from '@/lib/types';
import { cloudinaryLoader } from '@/utils/cloudenary-loader';
import { useTranslations } from 'next-intl';

// Icônes et composants UI
import { Building, Tag, MapPin } from 'lucide-react';

interface PartnerCardProps {
	partner: Partner;
	locale: string;
}

const PartnerCard: React.FC<PartnerCardProps> = ({ partner, locale }) => {
	const t = useTranslations('PartnersPage'); // Utiliser les traductions de la page parente
	const logoUrl = partner.logo || '/images/SHOP.png'; // Image par défaut

	// Logique pour obtenir la bonne traduction du nom
	const name = partner[`name${locale.charAt(0).toUpperCase() + locale.slice(1)}` as
		| 'nameFr'
		| 'nameEn'
		| 'nameAr'] || partner.name;
	// Description courte (optionnel, si vous l'ajoutez)
	// const description = partner[`description${locale.charAt(0).toUpperCase() + locale.slice(1)}` as 'descriptionFr' | 'descriptionEn' | 'descriptionAr'] || partner.description;

	return (
		<Link href={`/${locale}/partners/${partner.id}`} legacyBehavior>
			<a className="group block overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md">
				{/* Logo */}
				<div className="relative h-40 w-full bg-gray-100">
					<Image
						loader={cloudinaryLoader}
						src={logoUrl}
						alt={name}
						layout="fill"
						objectFit="contain" // 'contain' pour ne pas déformer le logo
						className="p-4" // Ajouter un peu d'espace autour du logo
						quality={75}
					/>
				</div>

				{/* Contenu */}
				<div className="p-5">
					{/* Nom */}
					<h3 className="truncate text-lg font-bold text-gray-900">{name}</h3>

					{/* Catégorie */}
					<div className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
						<Building className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <span>{(partner as any).category}</span>
					</div>

					{/* Adresse (si disponible) */}
                    {(partner as any)?.address && (
						<div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
							<MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />
                            <span className="truncate">{(partner as any).address}</span>
						</div>
					)}

					{/* Réduction */}
                    {(partner as any)?.discount && (
						<div className="mt-3 flex items-center gap-1.5 rounded-md bg-green-50 p-2 ring-1 ring-inset ring-green-200">
							<Tag className="h-4 w-4 flex-shrink-0 text-green-600" />
							<p className="text-sm font-medium text-green-700">
                                {(partner as any).discount}
							</p>
						</div>
					)}
				</div>
			</a>
		</Link>
	);
};

export default PartnerCard;