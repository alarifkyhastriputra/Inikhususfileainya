/**
 * Image & Imgur Utility Functions for Vimos.ai
 * Supports auto-resolving Imgur direct links, file uploads, and image URL normalization.
 */

/**
 * Normalizes an image URL, especially Imgur links:
 * - https://imgur.com/abc1234 -> https://i.imgur.com/abc1234.jpg
 * - https://imgur.com/a/abc1234 -> https://i.imgur.com/abc1234.jpg
 * - https://imgur.com/gallery/abc1234 -> https://i.imgur.com/abc1234.jpg
 * - Direct links like https://i.imgur.com/abc1234.png are kept intact.
 */
export function normalizeImageUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();

  // If empty or already a data URL / blob
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // Handle Imgur URLs
  if (url.includes('imgur.com')) {
    // Check if it already has direct extension (.jpg, .jpeg, .png, .webp, .gif)
    const hasExtension = /\.(jpe?g|png|webp|gif)$/i.test(url.split('?')[0]);

    if (!hasExtension) {
      // Remove trailing slash
      url = url.replace(/\/$/, '');

      // Match pattern like https://imgur.com/a/ID or https://imgur.com/gallery/ID or https://imgur.com/ID
      const albumMatch = url.match(/imgur\.com\/(?:a|gallery)\/([a-zA-Z0-9]+)/i);
      if (albumMatch && albumMatch[1]) {
        return `https://i.imgur.com/${albumMatch[1]}.jpg`;
      }

      const directIdMatch = url.match(/imgur\.com\/([a-zA-Z0-9]+)$/i);
      if (directIdMatch && directIdMatch[1]) {
        return `https://i.imgur.com/${directIdMatch[1]}.jpg`;
      }
    } else {
      // Ensure it starts with i.imgur.com instead of imgur.com
      if (url.includes('://imgur.com/')) {
        url = url.replace('://imgur.com/', '://i.imgur.com/');
      }
    }
  }

  return url;
}

/**
 * Checks if a string is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim();
  if (clean.startsWith('data:image/') || clean.startsWith('blob:') || clean.startsWith('/uploads/')) {
    return true;
  }
  try {
    const parsed = new URL(clean);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Checks if a URL is an online public image accessible from anywhere
 */
export function isPublicImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().toLowerCase();
  if (clean.startsWith('data:') || clean.startsWith('blob:') || clean.startsWith('/')) {
    return false;
  }
  return clean.startsWith('https://') || clean.startsWith('http://');
}

const CLIENT_IMGUR_IDS = [
  '546c25a59c58ad7',
  'e9998ea322e70bf',
  '28eb2add3a7c644',
  'c942858b975ec0b',
  'b025d57b324cb89'
];

/**
 * Uploads a local file to the server/Imgur and returns the real public direct URL
 */
export async function uploadImageFile(file: File): Promise<{ 
  success: boolean; 
  url: string; 
  directUrl: string; 
  isPublic: boolean; 
  provider?: string; 
  error?: string 
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      if (!base64) {
        resolve({ success: false, url: '', directUrl: '', isPublic: false, error: 'Gagal membaca file gambar' });
        return;
      }

      // 1. Try server-side upload endpoint (which uploads directly to Imgur CDN)
      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });
        const resData = await res.json();
        if (resData.success && resData.url) {
          const direct = normalizeImageUrl(resData.url);
          resolve({ 
            success: true, 
            url: direct, 
            directUrl: direct, 
            isPublic: isPublicImageUrl(direct),
            provider: resData.provider || 'imgur'
          });
          return;
        }
      } catch (err) {
        console.warn('Server upload failed, trying direct browser Imgur upload:', err);
      }

      // 2. Client-side fallback direct to Imgur if server is unreachable
      const cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
      for (const clientId of CLIENT_IMGUR_IDS) {
        try {
          const imgurRes = await fetch('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
              'Authorization': `Client-ID ${clientId}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              image: cleanBase64,
              type: 'base64'
            })
          });

          if (imgurRes.ok) {
            const data = await imgurRes.json();
            if (data?.success && data?.data?.link) {
              let link = String(data.data.link);
              if (link.startsWith('http://')) link = link.replace('http://', 'https://');
              resolve({
                success: true,
                url: link,
                directUrl: link,
                isPublic: true,
                provider: 'imgur'
              });
              return;
            }
          }
        } catch {
          // Try next client ID
        }
      }

      // 3. Last fallback: return the base64 data URL
      resolve({ 
        success: true, 
        url: base64, 
        directUrl: base64, 
        isPublic: false, 
        provider: 'local',
        error: 'Tersimpan lokal (offline)'
      });
    };
    reader.onerror = () => {
      resolve({ success: false, url: '', directUrl: '', isPublic: false, error: 'Gagal memproses file' });
    };
    reader.readAsDataURL(file);
  });
}
