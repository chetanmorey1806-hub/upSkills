import logoUrl from '../assets/ngu-logo.png';

// NGU ("Never Give Up") brand logo, HD 1024px artwork scaled to the requested size
export default function Logo({ size = 30 }) {
  return <img src={logoUrl} width={size} height={size} alt="" aria-hidden="true" className="brand-logo-svg brand-logo-img" draggable="false" />;
}
export { logoUrl };
