import * as Location from 'expo-location';

export const useCurrentLocation = () => {
  const currentPosition: () => Promise<Location.LocationObject | null> =
    async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return null;
        }

        // Utiliser la meilleure précision disponible pour la position initiale
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        
        // Valider que la précision est acceptable (moins de 50 mètres)
        if (loc.coords.accuracy && loc.coords.accuracy > 50) {
          console.warn('GPS accuracy is low:', loc.coords.accuracy, 'meters');
        }
        
        return loc;
      } catch (err) {
        console.error('Error getting current position:', err);
        return null;
      }
    };

  return { currentPosition };
};
