// Student profile (photo + details). Stored under an 'upskillr-' key, so auth.js keeps a separate copy per user.
import { useCallback, useEffect, useState } from 'react';

const KEY = 'upskillr-profile-v1';
const EVT = 'upskillr-profile';

export function readProfile() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
export function writeProfile(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { throw new Error('Could not save (browser storage is full). Try a smaller photo.'); }
  window.dispatchEvent(new Event(EVT));
}

export function useProfile() {
  const [p, setP] = useState(readProfile);
  useEffect(() => {
    const h = () => setP(readProfile());
    window.addEventListener(EVT, h); window.addEventListener('upskillr-auth', h); window.addEventListener('storage', h);
    return () => { window.removeEventListener(EVT, h); window.removeEventListener('upskillr-auth', h); window.removeEventListener('storage', h); };
  }, []);
  const update = useCallback((patch) => { const next = { ...readProfile(), ...patch }; writeProfile(next); }, []);
  return [p, update];
}

// Read an image file, crop/scale it and return a compressed JPEG data URL.
// square=true: centre-crop to a square of `size` px (profile photos). Otherwise fit inside maxW×maxH (banners).
export function imageToDataUrl(file, { size = 320, square = true, maxW = 1280, maxH = 560, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) { reject(new Error('Please choose an image file (JPG, PNG or WebP).')); return; }
    if (file.size > 15 * 1024 * 1024) { reject(new Error('Image is too large (max 15 MB).')); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');
      if (square) {
        const s = Math.min(img.width, img.height);
        c.width = size; c.height = size;
        ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      } else {
        const r = Math.min(1, maxW / img.width, maxH / img.height);
        c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
        ctx.drawImage(img, 0, 0, c.width, c.height);
      }
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('This image could not be read.')); };
    img.src = url;
  });
}

export function profileCompleteness(p) {
  const fields = ['photo', 'fullName', 'phone', 'college', 'degree', 'city', 'skills', 'bio', 'linkedin'];
  return Math.round((fields.filter((f) => (Array.isArray(p[f]) ? p[f].length : p[f])).length / fields.length) * 100);
}
