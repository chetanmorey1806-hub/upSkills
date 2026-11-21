// Contact details shown on the landing page (Contact section, footer, WhatsApp button, map).
//
// OWNER: fill these in with your real details. Every field left as an empty string is simply hidden
// on the site, so nothing fake is ever shown. Examples of the expected format are in the comments.
const siteInfo = {
  phone: '', // e.g. '+91 98xxxxxxxx' (shown as a "Call" link)
  whatsapp: '', // digits with country code, no + or spaces, e.g. '9198xxxxxxxx' (used for wa.me links)
  email: '', // e.g. 'hello@yourdomain.com'
  address: '', // full postal address shown in the Contact section and footer
  mapQuery: '', // what Google Maps should search for, e.g. 'NGU, FC Road, Pune' (leave empty to hide the map)
  social: {
    instagram: '', // full URL, e.g. 'https://instagram.com/yourpage'
    facebook: '', // full URL
    youtube: '', // full URL
    linkedin: '', // full URL
  },
};

export default siteInfo;

// helpers used by the landing components
export const waDigits = () => String(siteInfo.whatsapp || '').replace(/\D/g, '');
export const waLink = (text = '') => (waDigits() ? `https://wa.me/${waDigits()}${text ? `?text=${encodeURIComponent(text)}` : ''}` : '');
export const telLink = () => (siteInfo.phone ? `tel:${String(siteInfo.phone).replace(/[^\d+]/g, '')}` : '');
export const socialLinks = () => Object.entries(siteInfo.social || {}).filter(([, url]) => String(url || '').trim());
