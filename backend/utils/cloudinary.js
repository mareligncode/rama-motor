/**
 * Image / Document Upload Utility (e.g. Cloudinary / S3 / Direct URL)
 */

export function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  return isValidUrl(trimmed) ? trimmed : null;
}

export default {
  isValidUrl,
  sanitizeImageUrl,
};
