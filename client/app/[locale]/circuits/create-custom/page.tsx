// client/app/[locale]/circuits/create-custom/page.tsx
'use client';

import React, { useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCreateCustomCircuitMutation } from '@/services/api/CustomCircuitApi';
import POISelector from '@/components/custom-circuits/POISelector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Supposons que vous ayez ce composant
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateCustomCircuitPageProps {
	params: Promise<{
		locale: string;
	}>;
}

export default function CreateCustomCircuitPage({
	params,
}: CreateCustomCircuitPageProps) {
	const { locale } = use(params);
	const t = useTranslations('CustomCircuitCreate');
	const router = useRouter();

	// State for the form
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [selectedPoiIds, setSelectedPoiIds] = useState<string[]>([]);

	// RTK Query mutation for creating the circuit
	const [createCustomCircuit, { isLoading }] =
		useCreateCustomCircuitMutation();

	// Handler for POISelector component
	const handlePoiSelectionChange = (poiIds: string[]) => {
		setSelectedPoiIds(poiIds);
	};

	// Form submission handler
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (name.trim().length < 3) {
			toast.error(t('errorNameRequired'));
			return;
		}

		if (selectedPoiIds.length < 2) {
			toast.error(t('errorMinPois'));
			return;
		}

		try {
			// L'API attend les POIs sous forme d'objets { poiId, order }
			const pois = selectedPoiIds.map((poiId, index) => ({
				poiId,
				order: index + 1,
			}));

			await createCustomCircuit({
				name,
				description,
				pois,
			}).unwrap();

			toast.success(t('createSuccess'));
			// Rediriger vers la page des circuits
			router.push('/circuits');
		} catch (err) {
			// --- DÉBUT DE LA CORRECTION ---
			// Ne pas logger l'objet 'err' directement pour éviter l'erreur "extensible"
			// Loggez plutôt le contenu de l'erreur
			console.error('Failed to create custom circuit:', (err as any).data || err);
			// --- FIN DE LA CORRECTION ---
			toast.error(t('createError'));
		}
	};

	return (
		<main className="container mx-auto max-w-5xl px-4 py-24">
			<h1 className="mb-8 text-3xl font-bold tracking-tight">
				{t('title')}
			</h1>

			<form onSubmit={handleSubmit} className="space-y-8">
				{/* Étape 1: Détails du circuit */}
				<div className="rounded-lg border bg-card p-6 shadow-sm">
					<h2 className="mb-5 text-xl font-semibold">{t('step1Title')}</h2>
					<div className="space-y-4">
						<div>
							<Label htmlFor="circuitName">{t('circuitName')}</Label>
							<Input
								id="circuitName"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={t('circuitNamePlaceholder')}
								maxLength={100}
							/>
						</div>
						<div>
							<Label htmlFor="circuitDescription">
								{t('circuitDescription')}
							</Label>
							{/* Vous avez probablement un composant Textarea, sinon remplacez par Input */}
							<Textarea
								id="circuitDescription"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder={t('circuitDescriptionPlaceholder')}
								rows={4}
								maxLength={500}
							/>
						</div>
					</div>
				</div>

				{/* Étape 2: Sélection des POIs */}
				<div className="rounded-lg border bg-card p-6 shadow-sm">
					<h2 className="mb-5 text-xl font-semibold">{t('step2Title')}</h2>
					<POISelector
						locale={locale}
						onSelectionChange={handlePoiSelectionChange}
					/>
				</div>

				{/* Étape 3: Soumission */}
				<div className="flex justify-end gap-4">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.back()}
						disabled={isLoading}
					>
						{t('cancel')}
					</Button>
					<Button type="submit" disabled={isLoading || selectedPoiIds.length < 2}>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{t('creating')}
							</>
						) : (
							t('createButton')
						)}
					</Button>
				</div>
			</form>
		</main>
	);
}