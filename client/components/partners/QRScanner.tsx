// client/components/partners/QRScanner.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic'; // Pour charger côté client uniquement
import { useRegisterVisitMutation } from '@/services/api/PartnerApi';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CameraOff, CheckCircle, XCircle } from 'lucide-react';

// Charger le composant QrScanner dynamiquement côté client (typé en any pour éviter les erreurs de types)
const QrScanner = dynamic(() => import('react-qr-scanner') as any, { ssr: false }) as unknown as React.ComponentType<any>;

enum ScanStatus {
	Idle,
	Scanning,
	Success,
	Failure,
	Error,
}

const QRScanner: React.FC = () => {
	const t = useTranslations('QRScannerPage');
	const [status, setStatus] = useState<ScanStatus>(ScanStatus.Scanning);
	const [scanResult, setScanResult] = useState<any>(null); // Pour stocker la réponse API
	const [scannedData, setScannedData] = useState<string | null>(null);

	const [registerVisit, { isLoading }] = useRegisterVisitMutation();

	const handleScan = async (data: { text: string } | null) => {
		if (data && data.text !== scannedData && !isLoading && status === ScanStatus.Scanning) {
			setScannedData(data.text); // Éviter les scans multiples rapides
			console.log('Scanned QR:', data.text);
			try {
				const result = await registerVisit({ qrCode: data.text }).unwrap();
				setScanResult(result.data);
				setStatus(ScanStatus.Success);
				toast.success(t('scanSuccessTitle'), {
					description: t('scanSuccessMessage', { partnerName: result.data.partnerName }) + (result.data.pointsAwarded ? ` ${t('scanSuccessPoints')}` : ''),
				});
			} catch (err: any) {
				setScanResult(err.data?.message || t('scanFailureMessage'));
				setStatus(ScanStatus.Failure);
				toast.error(t('scanFailureTitle'), {
					description: err.data?.message || t('scanFailureMessage'),
				});
			}
		}
	};

	const handleError = (err: any) => {
		console.error('QR Scan Error:', err);
		setStatus(ScanStatus.Error);
		toast.error(t('scanError'));
	};

	const resetScanner = () => {
		setStatus(ScanStatus.Scanning);
		setScanResult(null);
		setScannedData(null);
	};

	const renderOverlay = () => {
		switch (status) {
			case ScanStatus.Success:
				return (
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
						<CheckCircle className="h-16 w-16 text-green-500" />
						<h3 className="mt-4 text-2xl font-bold">{t('scanSuccessTitle')}</h3>
						<p>{t('scanSuccessMessage', { partnerName: scanResult?.partnerName })}</p>
						{scanResult?.pointsAwarded && <p>{t('scanSuccessPoints')}</p>}
						<Button onClick={resetScanner} className="mt-6">{t('scanAgain')}</Button>
					</div>
				);
			case ScanStatus.Failure:
				return (
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
						<XCircle className="h-16 w-16 text-red-500" />
						<h3 className="mt-4 text-2xl font-bold">{t('scanFailureTitle')}</h3>
						<p>{scanResult || t('scanFailureMessage')}</p>
						<Button onClick={resetScanner} className="mt-6">{t('scanAgain')}</Button>
					</div>
				);
			case ScanStatus.Error:
				return (
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
						<CameraOff className="h-16 w-16 text-gray-500" />
						<h3 className="mt-4 text-xl font-semibold">{t('scanError')}</h3>
						<Button onClick={resetScanner} className="mt-6">{t('scanAgain')}</Button>
					</div>
				);
			case ScanStatus.Scanning:
			default:
				return (
					// Cadre de visée (optionnel)
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="h-64 w-64 rounded-lg border-4 border-dashed border-white/50" />
					</div>
				);
		}
	};

	return (
		<div className="relative mx-auto max-w-md overflow-hidden rounded-lg border shadow-lg">
			{/* Le composant QrScanner ne s'affiche que si le statut est Scanning */}
			{status === ScanStatus.Scanning && (
				<QrScanner
					delay={300}
					onError={handleError}
					onScan={handleScan}
					style={{ width: '100%' }}
					constraints={{
						video: { facingMode: 'environment' } // Utiliser la caméra arrière
					}}
				/>
			)}
			{renderOverlay()}
		</div>
	);
};

export default QRScanner;