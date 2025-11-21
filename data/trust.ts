import type { PartnerLogo, ComplianceBadge } from './trust.d';

export const partnerLogos: PartnerLogo[] = [
  {
    name: 'Bangkok Aesthetic Clinic',
    src: '/images/trust/bangkok-aesthetic-clinic.svg',
    href: 'https://example.com/bangkok-aesthetic',
  },
  {
    name: 'Chiang Mai Derma Center',
    src: '/images/trust/chiang-mai-derma-center.svg',
    href: 'https://example.com/chiang-mai-derma',
  },
  {
    name: 'Phuket Skin Studio',
    src: '/images/trust/phuket-skin-studio.svg',
    href: 'https://example.com/phuket-skin-studio',
  },
];

export const complianceBadges: ComplianceBadge[] = [
  { label: 'PDPA‑ready' },
  { label: 'GDPR‑friendly' },
  { label: 'Data Encryption' },
  { label: 'Audit Logging' },
];
