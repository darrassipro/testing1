// client/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * Hook pour "débriefer" une valeur.
 * @param value La valeur à débriefer
 * @param delay Le délai en millisecondes
 * @returns La valeur débriéfée
 */
export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		// Mettre à jour la valeur après le délai
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		// Annuler le timeout si la valeur change (ou si le composant est démonté)
		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]); // Ne ré-exécuter que si la valeur ou le délai change

	return debouncedValue;
}