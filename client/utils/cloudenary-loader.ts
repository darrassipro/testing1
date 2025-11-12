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
    return src; // fallback
  }

  // ✅ For public IDs only
  const params = [
    'f_auto',
    'c_limit',
    width ? `w_${width}` : '',
    height ? `h_${height}` : '',
    `q_${quality || 'auto'}`,
  ].filter(Boolean);

  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${params.join(',')}/${src}`;
};
