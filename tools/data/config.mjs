// Configuración global del sitio. Cambia aquí dominio, WhatsApp y GA4.
export const SITE = {
  name: 'YUNTRIA.IA',
  url: 'https://yuntria-ia.vercel.app', // dominio final: actualizar y volver a ejecutar `node tools/build.mjs`
  whatsapp: '51926998623',
  whatsappDisplay: '+51 926 998 623',
  ga4: '', // ej. 'G-XXXXXXXXXX'. Vacío = sin analytics
  updated: '17 de septiembre de 2026',
  legalName: 'YUNTRIA.IA (razón social por confirmar)',
};

export const wa = (msg) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`;
