// utils/cloudinary-loader.ts
export const cloudinaryLoader = ({
  src,
  width,
  height,
  quality,
}: {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
}) => {
  if (!src) return '';

  // ✅ FIX: If the image is local (starts with /), return it as-is to load from public folder
  if (src.startsWith('/')) {
    return src;
  }

  // ✅ If src is already a full Cloudinary URL, just append transformations
  if (src.startsWith('https://res.cloudinary.com/')) {
    const parts = src.split('/upload/');
    if (parts.length === 2) {
      const [base, rest] = parts;
      const params = [
        'f_auto',
        'c_limit',
        width ? `w_${width}` : '',
        height ? `h_${height}` : '',
        `q_${quality || 'auto'}`,
      ].filter(Boolean);

      return `${base}/upload/${params.join(',')}/${rest}`;
    }
    return src;
  }

  // ✅ For Cloudinary Public IDs
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  // Safety check if env var is missing (prevents 'undefined' in URL)
  if (!cloudName) {
      console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing');
      return src; 
  }

  const params = [
    'f_auto',
    'c_limit',
    width ? `w_${width}` : '',
    height ? `h_${height}` : '',
    `q_${quality || 'auto'}`,
  ].filter(Boolean);

  return `https://res.cloudinary.com/${cloudName}/image/upload/${params.join(',')}/${src}`;
};