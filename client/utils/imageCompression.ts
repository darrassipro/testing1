export interface CompressionOptions {
  maxSizeKB?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface CompressedImageResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> => {
  const {
    maxSizeKB = 512, // 0.5MB par défaut
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85
  } = options;

  const originalSize = file.size;
  const maxSizeBytes = maxSizeKB * 1024;

  // Si l'image fait déjà moins de 0.5MB, la retourner telle quelle
  if (originalSize <= maxSizeBytes) {
    console.log('Image déjà optimale, pas de compression nécessaire');
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1
    };
  }

  console.log(`Compression de l'image: ${Math.round(originalSize / 1024)}KB → ${maxSizeKB}KB max`);

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculer les nouvelles dimensions en gardant le ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Configurer le canvas
        canvas.width = width;
        canvas.height = height;

        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, width, height);

        // Compresser avec qualité adaptative
        let currentQuality = quality;
        let compressedDataUrl = '';

        const tryCompress = () => {
          compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
          const compressedSize = Math.round((compressedDataUrl.length * 3) / 4); // Approximation de la taille

          if (compressedSize <= maxSizeBytes || currentQuality <= 0.3) {
            // Convertir en File
            const byteString = atob(compressedDataUrl.split(',')[1]);
            const mimeString = compressedDataUrl.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }

            const compressedFile = new File([ab], file.name, {
              type: mimeString,
              lastModified: Date.now()
            });

            const compressionRatio = compressedSize / originalSize;
            
            console.log(` Image compressée: ${Math.round(originalSize / 1024)}KB → ${Math.round(compressedSize / 1024)}KB (${Math.round(compressionRatio * 100)}%)`);

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              compressionRatio
            });
          } else {
            // Réduire la qualité et réessayer
            currentQuality -= 0.1;
            console.log(`Réduction qualité à ${Math.round(currentQuality * 100)}%`);
            tryCompress();
          }
        };

        tryCompress();
      } catch (error) {
        console.error('Erreur lors de la compression:', error);
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'));
    };

    // Charger l'image
    img.src = URL.createObjectURL(file);
  });
};


export const compressSvg = async (file: File): Promise<CompressedImageResult> => {
  console.log(' SVG détecté, pas de compression nécessaire');
  return {
    file,
    originalSize: file.size,
    compressedSize: file.size,
    compressionRatio: 1
  };
};


export const compressImageByType = async (
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> => {
  if (file.type === 'image/svg+xml') {
    return compressSvg(file);
  } else if (file.type.startsWith('image/')) {
    return compressImage(file, options);
  } else {
    throw new Error('Type de fichier non supporté pour la compression');
  }
};
