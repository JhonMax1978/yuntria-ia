// Generador de páginas estáticas. Uso: node tools/build.mjs
// Produce HTML puro en la raíz del repo; el sitio publicado NO requiere build ni frameworks.
import { mkdirSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, wa } from './data/config.mjs';
import { industries } from './data/industries.mjs';
import { services } from './data/services.mjs';
import { posts } from './data/blog.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const urls = [];

/* ---------- utilidades ---------- */
function write(path, html) {
  const file = join(ROOT, path === '/' ? 'index.html' : join(path.replace(/^\//, ''), 'index.html'));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}
const fmtDate = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
const waBtn = (label, msg, cls = 'btn btn-primary') =>
  `<a class="${cls}" href="${wa(msg)}" target="_blank" rel="noopener" data-cta>${esc(label)}</a>`;

/* ---------- layout ---------- */
function head({ title, desc, path, type = 'website', jsonld = [], noindex = false }) {
  const full = `${title} | ${SITE.name}`;
  const canon = SITE.url + path;
  const ld = jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n');
  const ga = SITE.ga4
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${SITE.ga4}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${SITE.ga4}');</script>`
    : '';
  return `<!doctype html>
<html lang="es-PE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow'}">
<meta name="theme-color" content="#0a0b12">
<link rel="canonical" href="${canon}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="${type}">
<meta property="og:url" content="${canon}">
<meta property="og:locale" content="es_PE">
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:image" content="${SITE.url}/assets/img/og.svg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/css/styles.css">
<script>document.documentElement.classList.add('js')</script>
${ld}
${ga}
</head>`;
}

const logo = `<a class="logo" href="/" aria-label="YUNTRIA.IA, inicio"><span class="logo-mark" aria-hidden="true"></span>YUNTRIA<span class="logo-ia">.IA</span></a>`;

function header(active = '') {
  const dd = (id, label, items) => `
      <li class="has-dd">
        <button class="dd-toggle" aria-expanded="false" aria-controls="${id}">${label}<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <ul class="dd" id="${id}">${items.map(([href, t]) => `<li><a href="${href}"${active === href ? ' aria-current="page"' : ''}>${esc(t)}</a></li>`).join('')}</ul>
      </li>`;
  return `<body>
<a class="skip" href="#main">Saltar al contenido</a>
<header class="site-header" id="top">
  <div class="container nav-wrap">
    ${logo}
    <button class="nav-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="nav"><span></span><span></span><span></span></button>
    <nav id="nav" class="nav" aria-label="Principal">
      <ul>
        ${dd('dd-serv', 'Servicios', services.map((s) => [`/${s.slug}/`, s.name]))}
        ${dd('dd-ind', 'IA por Industria', industries.map((i) => [`/${i.slug}/`, i.name]))}
        ${dd('dd-rec', 'Recursos', [['/chatbot-whatsapp-para-negocios/', 'Chatbot WhatsApp para Negocios'], ['/herramientas-ia/', 'Herramientas de IA']])}
        <li><a class="nav-link" href="/blog/"${active === '/blog/' ? ' aria-current="page"' : ''}>Blog</a></li>
      </ul>
      ${waBtn('Contactar', 'Hola YUNTRIA.IA, quiero información sobre sus servicios de IA.', 'btn btn-primary btn-sm nav-cta')}
    </nav>
  </div>
</header>
<main id="main">`;
}

function footer() {
  const col = (t, items) => `<div><h3>${t}</h3><ul>${items.map(([h, l]) => `<li><a href="${h}">${esc(l)}</a></li>`).join('')}</ul></div>`;
  return `</main>
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      ${logo}
      <p>Consultora de inteligencia artificial para empresas en Perú y LATAM. Diagnóstico, estrategia e implementación práctica.</p>
      <a class="footer-wa" href="${wa('Hola YUNTRIA.IA, quiero una consulta gratuita.')}" target="_blank" rel="noopener">WhatsApp ${SITE.whatsappDisplay}</a>
    </div>
    ${col('Servicios', services.map((s) => [`/${s.slug}/`, s.name]))}
    ${col('IA por Industria', industries.map((i) => [`/${i.slug}/`, i.name]))}
    ${col('Recursos', [['/chatbot-whatsapp-para-negocios/', 'Chatbot WhatsApp'], ['/herramientas-ia/', 'Herramientas de IA'], ['/blog/', 'Blog']])}
  </div>
  <div class="container footer-bottom">
    <span>© 2026 ${SITE.name}. Todos los derechos reservados.</span>
    <span><a href="/politica-de-privacidad/">Privacidad</a> · <a href="/terminos-y-condiciones/">Términos</a></span>
  </div>
</footer>
<a class="wa-float" href="${wa('Hola YUNTRIA.IA, quiero una consulta gratuita.')}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp" data-cta>
  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/><circle cx="8" cy="10" r="1.3" fill="#25d366"/><circle cx="12" cy="10" r="1.3" fill="#25d366"/><circle cx="16" cy="10" r="1.3" fill="#25d366"/></svg>
</a>
<script src="/js/main.js" defer></script>
</body>
</html>`;
}

/* ---------- bloques reutilizables ---------- */
const eyebrow = (t) => (t ? `<p class="eyebrow">${esc(t)}</p>` : '');
const sectionHead = (eb, h, p = '') => `<div class="section-head" data-reveal>${eyebrow(eb)}<h2>${esc(h)}</h2>${p ? `<p>${esc(p)}</p>` : ''}</div>`;

const cards = (items, { numbered = false, mono = false, cols = 3 } = {}) =>
  `<div class="grid grid-${cols}">${items
    .map(
      ([t, d], i) => `<article class="card" data-reveal>
      ${numbered ? `<span class="num">${String(i + 1).padStart(2, '0')}</span>` : ''}
      <h3>${esc(t)}</h3><p>${esc(d)}</p></article>`
    )
    .join('')}</div>`;

const stats = (items) =>
  `<div class="stats">${items.map(([v, l]) => `<div class="stat" data-reveal><strong>${esc(v)}</strong><span>${esc(l)}</span></div>`).join('')}</div>`;

const steps = (items) =>
  `<ol class="steps">${items
    .map(([t, d], i) => `<li data-reveal><span class="step-n">${i + 1}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></li>`)
    .join('')}</ol>`;

const faq = (items) =>
  `<div class="faq">${items
    .map(([q, a]) => `<details data-reveal><summary>${esc(q)}</summary><div class="faq-a"><p>${esc(a)}</p></div></details>`)
    .join('')}</div>`;

const faqLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

const cta = (h, p, msg, label = 'Agendar consulta gratuita') => `
<section class="section cta-band"><div class="container">
  <div class="cta-box" data-reveal>
    <h2>${esc(h)}</h2>
    <p>${esc(p)}</p>
    ${waBtn(label, msg, 'btn btn-primary btn-lg')}
  </div>
</div></section>`;

const relatedCards = (slugs) => {
  const all = [
    ...services.map((s) => ({ slug: s.slug, name: s.name, d: s.short, kind: 'Servicio' })),
    ...industries.map((i) => ({ slug: i.slug, name: `IA para ${i.name}`, d: i.lead, kind: 'Industria' })),
    { slug: 'chatbot-whatsapp-para-negocios', name: 'Chatbot WhatsApp para Negocios', d: 'Atención, citas y cotizaciones automáticas por WhatsApp.', kind: 'Recurso' },
  ];
  return slugs
    .map((s) => all.find((x) => x.slug === s))
    .filter(Boolean)
    .map((x) => `<a class="card link-card" href="/${x.slug}/" data-reveal><span class="badge">${x.kind}</span><h3>${esc(x.name)}</h3><p>${esc(x.d)}</p><span class="more">Ver más →</span></a>`)
    .join('');
};

const pageHero = ({ label, h1, lead, ctas, extra = '' }) => `
<section class="hero page-hero"><div class="hero-glow" aria-hidden="true"></div>
  <div class="container hero-inner">
    ${label ? `<p class="eyebrow">${esc(label)}</p>` : ''}
    <h1>${esc(h1)}</h1>
    <p class="lead">${esc(lead)}</p>
    <div class="hero-actions">${ctas}</div>
    ${extra}
  </div>
</section>`;

const breadcrumb = (items) =>
  `<nav class="crumbs container" aria-label="Migas de pan">${items.map(([h, t]) => (h ? `<a href="${h}">${esc(t)}</a>` : `<span>${esc(t)}</span>`)).join(' / ')}</nav>`;

function emit(path, opts, body, active) {
  urls.push({ path, priority: opts.priority ?? 0.7, lastmod: opts.lastmod });
  write(path, head({ ...opts, path }) + '\n' + header(active ?? path) + body + footer());
}

/* ================= HOME ================= */
function buildHome() {
  const homeFaq = [
    ['¿Qué hace un consultor de inteligencia artificial?', 'Diagnostica tu negocio, identifica dónde la IA genera más valor, diseña una estrategia y te acompaña a implementarla hasta ver resultados.'],
    ['¿Cuánto cuesta contratar una consultora de IA?', 'Depende del alcance. La primera consulta es gratuita y, después del diagnóstico, recibes una propuesta formal a medida.'],
    ['¿Cuánto tiempo toma implementar?', 'Un agente básico toma de 2 a 4 semanas; una automatización compleja, de 1 a 3 meses.'],
    ['¿Qué resultados puedo esperar?', 'Es habitual una reducción de 40–70% del tiempo operativo en los procesos automatizados, medible desde el primer mes.'],
    ['¿En qué se diferencia de comprar un software de IA?', 'Un software te da una herramienta; nosotros definimos qué problema resolver, lo implementamos en tu operación y lo medimos contigo.'],
    ['¿Qué sectores se benefician más?', 'Estudios jurídicos y contables, salud, restaurantes, hoteles, inmobiliarias, call centers, RR.HH., finanzas y arquitectura, entre otros.'],
    ['¿Necesito conocimientos técnicos?', 'No. Nos encargamos de la parte técnica y capacitamos a tu equipo.'],
    ['¿La IA reemplazará a mis empleados?', 'No. Libera tiempo de tareas repetitivas para que tu equipo se concentre en lo que aporta valor.'],
    ['¿Mis datos estarán seguros?', 'Aplicamos accesos restringidos, mínimo de datos necesarios y buenas prácticas alineadas con la Ley 29733 de protección de datos personales.'],
    ['¿Puedo integrar IA con WhatsApp?', 'Sí. WhatsApp es uno de los canales más usados en nuestros proyectos: atención, citas y cotizaciones.'],
    ['¿Ofrecen una primera consulta gratuita?', 'Sí. Una conversación de 15 a 30 minutos, sin compromiso.'],
    ['¿Trabajan con empresas fuera de Lima?', 'Sí. Trabajamos de forma remota con empresas de todo el Perú y LATAM.'],
  ];
  const body = `
<section class="hero"><div class="hero-glow" aria-hidden="true"></div><div class="hero-grid" aria-hidden="true"></div>
  <div class="container hero-inner">
    <p class="eyebrow pill">Consultora de inteligencia artificial · Perú y LATAM</p>
    <h1>Consultor IA en Perú: <span class="grad">lleva tu empresa al siguiente nivel</span></h1>
    <p class="lead">Integramos inteligencia artificial en tus procesos: diagnóstico, estrategia e implementación práctica, con resultados medibles desde el primer mes.</p>
    <div class="hero-actions">
      ${waBtn('Agendar consulta gratuita', 'Hola YUNTRIA.IA, quiero agendar una consulta gratuita.', 'btn btn-primary btn-lg')}
      <a class="btn btn-ghost btn-lg" href="#servicios">Ver servicios</a>
    </div>
    <ul class="hero-trust"><li>Diagnóstico sin costo</li><li>Sin conocimientos técnicos</li><li>Soporte por WhatsApp</li></ul>
  </div>
</section>

<section class="section" id="contexto"><div class="container">
  ${sectionHead('El contexto', 'Tu competencia ya está usando IA. ¿Y tú?')}
  ${cards([
    ['Procesos manuales lentos', 'Tareas repetitivas que consumen horas de tu equipo y frenan el crecimiento.'],
    ['Oportunidades perdidas', 'Clientes que no reciben respuesta a tiempo y se van con quien sí contesta.'],
    ['Implementaciones fallidas', 'El 70% de los proyectos de IA fracasa cuando se empieza sin una estrategia clara.'],
  ])}
</div></section>

<section class="section alt" id="servicios"><div class="container">
  ${sectionHead('Qué hacemos', 'Servicios de consultoría e implementación de IA', 'Cuatro formas de empezar, todas con el mismo enfoque: práctico y medible.')}
  <div class="grid grid-2">${services
    .map(
      (s) => `<a class="card service-card" href="/${s.slug}/" data-reveal>
      <span class="badge">${s.badge}</span><h3>${esc(s.name)}</h3><p>${esc(s.short)}</p><span class="more">Conocer más →</span></a>`
    )
    .join('')}</div>
</div></section>

<section class="section" id="proceso"><div class="container">
  ${sectionHead('Cómo trabajamos', 'Un proceso simple en 4 pasos')}
  ${steps([
    ['Diagnóstico', 'Entendemos tu negocio, tus procesos y dónde la IA generaría más impacto.'],
    ['Estrategia', 'Definimos casos de uso, prioridades, herramientas y métricas de éxito.'],
    ['Implementación', 'Construimos, integramos y probamos las soluciones junto a tu equipo.'],
    ['Optimización', 'Medimos resultados y mejoramos de forma continua.'],
  ])}
</div></section>

<section class="section alt" id="por-que"><div class="container">
  ${sectionHead('Diferenciales', '¿Por qué YUNTRIA.IA?')}
  ${cards([
    ['Enfoque práctico', 'No nos quedamos en la recomendación: implementamos y acompañamos hasta que funcione.'],
    ['Resultados desde el primer mes', 'Cada proyecto parte de metas medibles que revisamos contigo.'],
    ['IA + SEO combinados', 'Un stack integrado para automatizar operaciones y atraer clientes desde Google.'],
  ])}
  ${stats([['5+', 'años de experiencia en consultoría digital'], ['IA + SEO', 'stack integrado'], ['100%', 'orientado a resultados']])}
</div></section>

<section class="section" id="faq"><div class="container narrow">
  ${sectionHead('Preguntas frecuentes', 'Resolvemos tus dudas')}
  ${faq(homeFaq)}
</div></section>
${cta('¿Listo para integrar IA en tu negocio?', 'Cuéntanos tu caso en una consulta gratuita y sin compromiso.', 'Hola YUNTRIA.IA, quiero integrar IA en mi negocio.')}`;
  emit('/', {
    title: 'Consultor IA en Perú',
    desc: 'YUNTRIA.IA es una consultora de inteligencia artificial para empresas en Perú: agentes IA, automatización, estrategia e IA + SEO. Consulta gratuita.',
    priority: 1,
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: SITE.name, url: SITE.url, areaServed: 'PE', telephone: SITE.whatsappDisplay, description: 'Consultora de inteligencia artificial para empresas' },
      faqLd(homeFaq),
    ],
  }, body, '/');
}

/* ================= SERVICIOS ================= */
function buildService(s) {
  const ctas = `${waBtn(s.cta, s.msg, 'btn btn-primary btn-lg')}${s.secondary ? `<a class="btn btn-ghost btn-lg" href="${s.secondary.href}">${s.secondary.label}</a>` : ''}`;
  const diagram = s.diagram ? `<ul class="flow" aria-label="Flujo de automatización">${s.diagram.map((d) => `<li>${d}</li>`).join('')}</ul>` : '';
  let body = breadcrumb([['/', 'Inicio'], [null, s.name]]) + pageHero({ label: s.label, h1: s.h1, lead: s.lead, ctas, extra: diagram });
  if (s.intro)
    body += `<section class="section"><div class="container two-col">
      <div data-reveal><p class="eyebrow">Concepto</p><h2>${esc(s.intro.h)}</h2><p>${esc(s.intro.p)}</p></div>
      <ul class="check-list" data-reveal>${s.intro.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div></section>`;
  if (s.why) body += `<section class="section"><div class="container">${sectionHead('El problema', s.why.h)}${cards(s.why.items)}</div></section>`;
  body += `<section class="section alt"${s.blocks.id ? ` id="${s.blocks.id}"` : ''}><div class="container">${sectionHead(s.blocks.eyebrow, s.blocks.h)}${cards(s.blocks.items, { numbered: s.blocks.numbered, cols: 2 })}</div></section>`;
  if (s.stats) body += `<section class="section"><div class="container">${sectionHead('Resultados', s.stats.h)}${stats(s.stats.items)}</div></section>`;
  body += `<section class="section" id="proceso-trabajo"><div class="container">${sectionHead('Proceso', s.stepsH)}${steps(s.steps)}</div></section>`;
  if (s.others) body += `<section class="section alt"><div class="container">${sectionHead('Complementos', 'Servicios SEO relacionados')}<ul class="pills" data-reveal>${s.others.map((o) => `<li>${esc(o)}</li>`).join('')}</ul></div></section>`;
  body += cta(s.ctaH, s.ctaP || 'Agenda una consulta gratuita y sin compromiso.', s.msg, s.cta);
  body += `<section class="section"><div class="container">${sectionHead('Servicios relacionados', 'Sigue explorando')}<div class="grid grid-3">${relatedCards(s.related)}</div><p class="back"><a href="/#servicios">← Ver todos los servicios</a></p></div></section>`;
  emit(`/${s.slug}/`, { title: s.title, desc: s.lead, priority: 0.9, jsonld: [{ '@context': 'https://schema.org', '@type': 'Service', name: s.name, provider: { '@type': 'ProfessionalService', name: SITE.name }, areaServed: 'PE', description: s.lead }] }, body);
}

/* ================= INDUSTRIAS ================= */
function buildIndustry(i) {
  const msg = `Hola YUNTRIA.IA, quiero una consulta gratuita sobre IA para ${i.name.toLowerCase()}.`;
  const body = breadcrumb([['/', 'Inicio'], ['/herramientas-ia/#industrias', 'IA por Industria'], [null, i.name]]) +
    pageHero({
      label: i.label || 'IA por industria',
      h1: i.h1, lead: i.lead,
      ctas: `${waBtn('Agendar consulta gratuita', msg, 'btn btn-primary btn-lg')}<a class="btn btn-ghost btn-lg" href="#soluciones">Ver soluciones</a>`,
      extra: `<ul class="hero-trust"><li>Consulta gratuita</li><li>Sin conocimientos técnicos</li><li>Soporte por WhatsApp</li></ul>`,
    }) +
    `<section class="section" id="problema"><div class="container">${sectionHead('El problema', `Lo que frena a tu negocio hoy`)}${cards(i.pain)}</div></section>
<section class="section alt" id="soluciones"><div class="container">${sectionHead('Soluciones', `Cómo la IA transforma tu operación`)}${cards(i.sol, { cols: 2 })}</div></section>
<section class="section" id="resultados"><div class="container">${sectionHead('Resultados', 'Resultados medibles desde el primer mes')}${stats(i.stats)}</div></section>
<section class="section alt" id="proceso"><div class="container">${sectionHead('Proceso', 'Cómo lo implementamos')}${steps(i.steps)}</div></section>
<section class="section" id="faq"><div class="container narrow">${sectionHead('Preguntas frecuentes', `IA para ${i.name.toLowerCase()}: lo que más nos preguntan`)}${faq(i.faq)}</div></section>
${cta(`Lleva tu negocio al siguiente nivel con IA`, 'Agenda una consulta gratuita y recibe una primera lectura de tus oportunidades.', msg)}
<section class="section"><div class="container">${sectionHead('Relacionado', 'Otras soluciones que pueden interesarte')}<div class="grid grid-3">${relatedCards(i.related)}</div><p class="back"><a href="/herramientas-ia/#industrias">Todas las soluciones por industria →</a></p></div></section>`;
  emit(`/${i.slug}/`, { title: i.title, desc: i.lead, priority: 0.8, jsonld: [faqLd(i.faq)] }, body);
}

/* ================= CHATBOT WHATSAPP ================= */
function buildChatbot() {
  const msg = 'Hola YUNTRIA.IA, quiero mi chatbot de WhatsApp para mi negocio.';
  const faqs = [
    ['¿Cuánto cuesta un chatbot de WhatsApp?', 'Depende de los flujos e integraciones. La consulta es gratuita y recibes una propuesta a medida.'],
    ['¿Cuánto demora la implementación?', 'Un bot básico toma de 5 a 7 días hábiles; integraciones complejas, de 2 a 4 semanas.'],
    ['¿Necesito la API de WhatsApp Business?', 'Para operar a escala se recomienda la API oficial; te guiamos en la solicitud y configuración.'],
    ['¿Pueden atender varios agentes a la vez?', 'Sí. El bot responde en paralelo y deriva a tu equipo cuando hace falta.'],
    ['¿En qué idiomas funciona?', 'Español, inglés y otros idiomas según tu mercado.'],
    ['¿Con qué sistemas se integra?', 'Google Calendar, HubSpot, Salesforce, pasarelas de pago y otros mediante conectores.'],
    ['¿Qué tan seguros están los datos?', 'Aplicamos accesos restringidos, cifrado en tránsito y mínimo de datos necesarios.'],
    ['¿Hay un límite de mensajes?', 'Sin límite práctico por parte del bot; aplican las condiciones de la plataforma de WhatsApp.'],
  ];
  const demo = `
    <div class="chat" id="chat-demo" aria-label="Demostración de chatbot de WhatsApp">
      <div class="chat-head"><span class="avatar">IA</span><div><strong>Asistente IA</strong><small>en línea</small></div><button type="button" class="chat-reset" aria-label="Reiniciar demostración">↺</button></div>
      <div class="chat-body" id="chat-body" aria-live="polite"></div>
      <div class="chat-actions" id="chat-actions"></div>
    </div>`;
  const body = breadcrumb([['/', 'Inicio'], [null, 'Chatbot WhatsApp para Negocios']]) + `
<section class="hero page-hero"><div class="hero-glow" aria-hidden="true"></div>
  <div class="container hero-inner two-col">
    <div>
      <p class="eyebrow">Recurso</p>
      <h1>Chatbot WhatsApp para Negocios: Automatiza tu Atención al Cliente</h1>
      <p class="lead">Responde al instante, agenda citas y envía cotizaciones por WhatsApp las 24 horas, sin sumar personal.</p>
      <div class="hero-actions">${waBtn('Quiero mi chatbot', msg, 'btn btn-primary btn-lg')}<a class="btn btn-ghost btn-lg" href="#que-puede-hacer">Ver funcionalidades</a></div>
    </div>
    ${demo}
  </div>
</section>
<section class="section"><div class="container">${sectionHead('El problema', 'Cada mensaje sin respuesta es un cliente menos')}
${cards([
  ['Mensajes nocturnos', 'Los clientes escriben fuera de horario y nadie contesta hasta el día siguiente.'],
  ['Respuesta lenta', 'El 78% de los clientes compra al primer negocio que responde.'],
  ['Preguntas repetitivas', 'Tu equipo contesta una y otra vez lo mismo: precios, horarios, ubicación.'],
])}</div></section>
<section class="section alt" id="que-puede-hacer"><div class="container">${sectionHead('Funcionalidades', 'Lo que puede hacer tu chatbot')}
${cards([
  ['Respuestas automáticas 24/7', 'Resuelve las preguntas frecuentes en el momento, con el tono de tu marca.'],
  ['Agendamiento de citas', 'Ofrece horarios disponibles y sincroniza con tu calendario.'],
  ['Cotizaciones instantáneas', 'Calcula y envía presupuestos según lo que pide el cliente.'],
  ['Seguimiento y recordatorios', 'Avisa antes de cada cita y retoma conversaciones pendientes.'],
], { cols: 2 })}</div></section>
<section class="section"><div class="container">${sectionHead('Industrias', 'Industrias que ya usan chatbot WhatsApp')}
<div class="grid grid-3">${['ia-para-restaurantes', 'ia-para-dentistas', 'ia-para-abogados', 'ia-para-hoteles', 'ia-para-consultorios', 'ia-para-call-center'].map((s) => { const i = industries.find((x) => x.slug === s); return `<a class="card link-card" href="/${s}/" data-reveal><h3>${esc(i.name)}</h3><p>${esc(i.lead)}</p><span class="more">Ver solución →</span></a>`; }).join('')}</div></div></section>
<section class="section alt"><div class="container">${sectionHead('Resultados', 'Impacto medible')}${stats([['-80%', 'tiempo de respuesta'], ['+50%', 'conversión en ventas'], ['24/7', 'atención']])}</div></section>
<section class="section"><div class="container">${sectionHead('Proceso', 'Cómo lo implementamos')}${steps([
  ['Diagnóstico gratuito', 'Revisamos tus consultas más frecuentes y los canales por donde llegan.'],
  ['Diseño e implementación', 'Creamos los flujos, integramos calendario, CRM y pagos, y entrenamos al bot con tu información.'],
  ['Lanzamiento y optimización', 'Salimos en vivo y mejoramos con un panel de métricas en tiempo real.'],
])}</div></section>
<section class="section alt" id="faq"><div class="container narrow">${sectionHead('Preguntas frecuentes', 'Chatbot de WhatsApp: tus dudas')}${faq(faqs)}</div></section>
${cta('Activa tu chatbot WhatsApp y deja de perder clientes', 'Consulta gratuita de 15 minutos, sin compromiso.', msg, 'Quiero mi chatbot')}`;
  emit('/chatbot-whatsapp-para-negocios/', { title: 'Chatbot WhatsApp para Negocios: Automatiza tu Atención al Cliente', desc: 'Chatbot de WhatsApp con IA para negocios: responde 24/7, agenda citas y envía cotizaciones. Pruébalo en la demo.', priority: 0.9, jsonld: [faqLd(faqs)] }, body);
}

/* ================= HERRAMIENTAS ================= */
function buildTools() {
  const faqs = [
    ['¿Qué son las herramientas de inteligencia artificial para empresas?', 'Son aplicaciones que automatizan tareas, analizan información o conversan con clientes usando modelos de IA.'],
    ['¿Cuánto cuestan?', 'Hay desde opciones gratuitas hasta soluciones a medida. El costo real depende del problema que resuelves y del esfuerzo de implementarlas.'],
    ['¿Necesito conocimientos técnicos?', 'Para usarlas, no. Para elegirlas e integrarlas bien conviene acompañamiento, y allí te ayudamos.'],
    ['¿Qué tipo de empresa se beneficia?', 'Desde profesionales independientes hasta empresas medianas, en cualquier sector con procesos repetitivos o atención al cliente.'],
    ['¿En cuánto tiempo veo resultados?', 'Normalmente entre 2 y 4 semanas para los primeros casos de uso.'],
    ['¿La IA reemplaza a mis empleados?', 'No. Asume tareas repetitivas para que tu equipo se dedique a lo que requiere criterio.'],
    ['¿Cómo elijo la herramienta correcta?', 'Parte del problema, no de la herramienta: evalúa facilidad de implementación, integración y escalabilidad, y empieza con una prueba pequeña.'],
    ['¿Funcionan con WhatsApp?', 'Sí. Pueden integrarse con WhatsApp, Messenger e Instagram.'],
  ];
  const cats = [
    ['Chatbots y Atención al Cliente', 'Asistentes que responden y agendan 24/7.', '/chatbot-whatsapp-para-negocios/'],
    ['Automatización de Procesos', 'Flujos que ejecutan tareas repetitivas por ti.', '/automatizacion-ia/'],
    ['Análisis de Datos y BI', 'Reportes y tableros con IA.', null],
    ['CRM y Ventas con IA', 'Seguimiento y calificación de oportunidades.', null],
  ];
  const body = breadcrumb([['/', 'Inicio'], [null, 'Herramientas de IA']]) + pageHero({
    label: 'Guía completa 2026',
    h1: 'Herramientas de Inteligencia Artificial: Guía para Empresas y Negocios',
    lead: 'Una guía práctica para entender qué herramientas de IA existen, cuáles aplican a tu sector y cómo elegir sin perder tiempo ni dinero.',
    ctas: `${waBtn('Consulta gratuita', 'Hola YUNTRIA.IA, quiero asesoría para elegir herramientas de IA.', 'btn btn-primary btn-lg')}<a class="btn btn-ghost btn-lg" href="#categorias">Ver categorías</a>`,
  }) + `
<section class="section" id="categorias"><div class="container">${sectionHead('Categorías', 'Categorías de herramientas IA para empresas')}
<div class="grid grid-2">${cats.map(([t, d, h]) => h
    ? `<a class="card link-card" href="${h}" data-reveal><h3>${t}</h3><p>${d}</p><span class="more">Ver solución →</span></a>`
    : `<article class="card" data-reveal><span class="badge soon">Próximamente</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div></div></section>
<section class="section alt" id="industrias"><div class="container">${sectionHead('Por industria', 'Inteligencia artificial por industria')}
<div class="grid grid-3">${industries.map((i) => `<a class="card link-card" href="/${i.slug}/" data-reveal><h3>${esc(i.name)}</h3><p>${esc(i.lead)}</p><span class="more">Ver solución →</span></a>`).join('')}</div></div></section>
<section class="section" id="como-elegir"><div class="container">${sectionHead('Cómo elegir', 'Cómo elegir la herramienta IA correcta para tu empresa')}
${cards([
  ['Identifica el problema', 'Define qué proceso quieres mejorar y cómo lo vas a medir antes de mirar herramientas.'],
  ['Evalúa tres criterios', 'Facilidad de implementación, integración con tus sistemas y capacidad de escalar.'],
  ['Considera soporte y personalización', 'Una herramienta genérica rara vez encaja con un sector específico sin ajustes.'],
  ['Empieza pequeño y mide 30 días', 'Un piloto acotado reduce riesgos y te da datos reales para decidir.'],
], { cols: 2, numbered: true })}</div></section>
<section class="section alt" id="faq"><div class="container narrow">${sectionHead('Preguntas frecuentes', 'Herramientas IA: lo esencial')}${faq(faqs)}</div></section>
${cta('¿Listo para implementar herramientas IA en tu empresa?', 'Te ayudamos a elegir, implementar y medir.', 'Hola YUNTRIA.IA, quiero implementar herramientas de IA en mi empresa.')}`;
  emit('/herramientas-ia/', { title: 'Herramientas de Inteligencia Artificial: Guía para Empresas y Negocios', desc: 'Guía 2026 de herramientas de IA para empresas: categorías, soluciones por industria y cómo elegir la correcta.', priority: 0.7, jsonld: [faqLd(faqs)] }, body);
}

/* ================= BLOG ================= */
const paragraphs = (blocks) => blocks.map(([t, c]) => (t === 'h' ? `<h2>${esc(c)}</h2>` : t === 'p' ? `<p>${esc(c)}</p>` : `<ul>${c.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`)).join('\n');
const sorted = [...posts].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.date.localeCompare(a.date));
const cardPost = (p) => `<article class="card post-card" data-reveal data-cat="${esc(p.cat)}" data-title="${esc((p.title + ' ' + p.excerpt).toLowerCase())}">
  <a class="post-thumb" href="/blog/${p.slug}/" aria-hidden="true" tabindex="-1"><span>${esc(p.cat.split(' ').pop().slice(0, 2).toUpperCase())}</span></a>
  <span class="badge">${esc(p.cat)}</span>
  <h3><a href="/blog/${p.slug}/">${esc(p.title)}</a></h3>
  <p>${esc(p.excerpt)}</p>
  <small>${fmtDate(p.date)} · ${p.min} min de lectura</small></article>`;

function buildBlog() {
  const feat = posts.find((p) => p.featured);
  const rest = sorted.filter((p) => !p.featured);
  const catCount = {};
  posts.forEach((p) => (catCount[p.cat] = (catCount[p.cat] || 0) + 1));
  const body = breadcrumb([['/', 'Inicio'], [null, 'Blog']]) + `
<section class="hero page-hero"><div class="hero-glow" aria-hidden="true"></div><div class="container hero-inner">
  <p class="eyebrow">Recursos &amp; Insights</p><h1>Blog de IA para tu negocio</h1>
  <p class="lead">Guías prácticas y casos de uso de inteligencia artificial por sector.</p></div></section>
<section class="section"><div class="container">
  <article class="card featured" data-reveal><span class="badge">★ Destacado</span><h2><a href="/blog/${feat.slug}/">${esc(feat.title)}</a></h2><p>${esc(feat.excerpt)}</p>
  <small>Equipo de redacción · ${fmtDate(feat.date)} · ${feat.min} min de lectura</small><a class="btn btn-primary btn-sm" href="/blog/${feat.slug}/">Leer artículo →</a></article>
  <div class="blog-layout">
    <div>
      <p id="blog-empty" class="muted" hidden>No encontramos artículos con ese criterio.</p>
      <div class="grid grid-2" id="post-grid" data-per-page="9">${rest.map(cardPost).join('')}</div>
      <nav class="pagination" id="pagination" aria-label="Paginación del blog"></nav>
    </div>
    <aside class="sidebar">
      <div class="widget"><h3>Buscar</h3><form role="search" onsubmit="return false"><input type="search" id="blog-search" placeholder="Buscar artículos…" aria-label="Buscar artículos"></form></div>
      <div class="widget"><h3>Categorías</h3><ul class="cat-list" id="cat-list"><li><button type="button" data-cat="" class="active">Todas <span>${posts.length}</span></button></li>${Object.entries(catCount).map(([c, n]) => `<li><button type="button" data-cat="${esc(c)}">${esc(c)} <span>${n}</span></button></li>`).join('')}</ul></div>
      <div class="widget"><h3>Destacados</h3><ul class="mini-list">${sorted.slice(0, 3).map((p) => `<li><a href="/blog/${p.slug}/">${esc(p.title)}</a></li>`).join('')}</ul></div>
      <div class="widget newsletter"><h3>Newsletter IA</h3><p>1 email a la semana con ideas prácticas de IA para tu negocio.</p>
        <form id="newsletter" novalidate><label class="sr-only" for="nl-email">Tu correo</label><input type="email" id="nl-email" placeholder="tucorreo@empresa.com" required autocomplete="email"><button class="btn btn-primary btn-sm" type="submit">Suscribirme</button><p class="form-msg" id="nl-msg" role="status"></p></form></div>
    </aside>
  </div>
</div></section>`;
  emit('/blog/', { title: 'Blog de IA para tu negocio', desc: 'Artículos y guías sobre inteligencia artificial aplicada a hoteles, consultorios, finanzas, RR.HH., inmobiliarias y más.', priority: 0.8 }, body);

  for (const p of posts) {
    const idx = sorted.findIndex((x) => x.slug === p.slug);
    const rel = sorted.filter((x) => x.slug !== p.slug && x.cat === p.cat).concat(sorted.filter((x) => x.slug !== p.slug && x.cat !== p.cat)).slice(0, 2);
    const art = breadcrumb([['/', 'Inicio'], ['/blog/', 'Blog'], [null, p.cat]]) + `
<article class="container narrow post">
  <header><span class="badge">${esc(p.cat)}</span><h1>${esc(p.title)}</h1><p class="lead">${esc(p.excerpt)}</p>
  <small>Equipo de redacción · <time datetime="${p.date}">${fmtDate(p.date)}</time> · ${p.min} min de lectura</small></header>
  <div class="prose">${paragraphs(p.body)}</div>
</article>
${cta('¿Quieres aplicar esto en tu negocio?', 'Agenda una consulta gratuita y vemos cómo adaptarlo a tu caso.', `Hola YUNTRIA.IA, leí "${p.title}" y quiero una consulta gratuita.`)}
<section class="section"><div class="container">${sectionHead('Sigue leyendo', 'Más artículos')}<div class="grid grid-2">${rel.map(cardPost).join('')}</div></div></section>`;
    emit(`/blog/${p.slug}/`, {
      title: p.title, desc: p.excerpt, type: 'article', priority: 0.6, lastmod: p.date,
      jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: p.title, datePublished: p.date, inLanguage: 'es-PE', author: { '@type': 'Organization', name: SITE.name }, publisher: { '@type': 'Organization', name: SITE.name } }],
    }, art, '/blog/');
  }
}

/* ================= LEGALES ================= */
function legal(path, title, desc, sections) {
  const body = breadcrumb([['/', 'Inicio'], [null, title]]) + `
<article class="container narrow post"><header><h1>${esc(title)}</h1><small>Última actualización: ${SITE.updated}</small></header>
<div class="prose">${sections.map(([h, ...ps]) => `<h2>${esc(h)}</h2>${ps.map((p) => (Array.isArray(p) ? `<ul>${p.map((x) => `<li>${x}</li>`).join('')}</ul>` : `<p>${p}</p>`)).join('')}`).join('')}</div></article>`;
  emit(path, { title, desc, priority: 0.3 }, body, path);
}
function buildLegal() {
  legal('/politica-de-privacidad/', 'Política de Privacidad', 'Cómo YUNTRIA.IA trata tus datos personales conforme a la Ley 29733.', [
    ['Responsable del tratamiento', `${esc(SITE.legalName)}, con domicilio en Lima, Perú. Contacto por WhatsApp: ${SITE.whatsappDisplay}.`],
    ['Qué datos recogemos', 'Los datos que nos compartes al escribirnos por WhatsApp (nombre, teléfono y el contenido de tu consulta) y datos de navegación anónimos obtenidos mediante Google Analytics 4 cuando está activo.'],
    ['Con qué finalidad', ['Responder tus consultas y preparar propuestas.', 'Mejorar el contenido y el rendimiento del sitio.']],
    ['Base legal', 'Tu consentimiento al contactarnos y el interés legítimo en mejorar nuestros servicios, conforme a la Ley N.° 29733, Ley de Protección de Datos Personales.'],
    ['Terceros con acceso a los datos', ['Google LLC (analítica).', 'WhatsApp / Meta (mensajería).', 'Vercel Inc. (alojamiento del sitio).']],
    ['Cuánto tiempo conservamos los datos', 'Hasta 4 años, o menos si solicitas su eliminación y no existe obligación legal de conservarlos.'],
    ['Cookies', 'Usamos cookies analíticas para entender cómo se usa el sitio. Puedes bloquearlas desde la configuración de tu navegador.'],
    ['Tus derechos', 'Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (ARCO) escribiéndonos por WhatsApp. También puedes acudir a la Autoridad Nacional de Protección de Datos Personales.'],
    ['Cambios en esta política', 'Publicaremos cualquier cambio en esta página, con su fecha de actualización.'],
  ]);
  legal('/terminos-y-condiciones/', 'Términos y Condiciones', 'Condiciones de uso del sitio web de YUNTRIA.IA.', [
    ['Titular del sitio', `${esc(SITE.legalName)}, Lima, Perú.`],
    ['Objeto y aceptación', 'Al navegar por este sitio aceptas estos términos. Si no estás de acuerdo, te pedimos no usarlo.'],
    ['Naturaleza del contenido', 'El contenido es informativo y no constituye asesoría profesional legal, contable, médica ni financiera. Las cifras son referenciales y varían según cada caso.'],
    ['Contratación de servicios', 'La información publicada no es vinculante. La propuesta formal que recibes tras el diagnóstico es la que define el alcance, plazos y condiciones del servicio.'],
    ['Propiedad intelectual', 'Textos, diseños y marca son propiedad del titular. Se prohíbe su reproducción masiva o extracción automatizada, incluido su uso para entrenar sistemas de IA, sin autorización previa.'],
    ['Enlaces a terceros', 'Podemos enlazar sitios externos; no controlamos ni respondemos por su contenido.'],
    ['Limitación de responsabilidad', 'No garantizamos resultados específicos por el uso de la información del sitio ni respondemos por interrupciones del servicio.'],
    ['Privacidad', 'El tratamiento de datos personales se rige por nuestra <a href="/politica-de-privacidad/">Política de Privacidad</a>.'],
    ['Ley aplicable y jurisdicción', 'Estos términos se rigen por las leyes de Perú; cualquier controversia se someterá a los tribunales de Lima.'],
    ['Modificaciones', 'Podemos actualizar estos términos; la versión vigente es la publicada en esta página.'],
  ]);
}

/* ================= 404, sitemap, robots ================= */
function build404() {
  const html = head({ title: 'Página no encontrada', desc: 'La página que buscas no existe.', path: '/404.html', noindex: true }) + '\n' + header('') +
    `<section class="hero page-hero"><div class="hero-glow" aria-hidden="true"></div><div class="container hero-inner"><p class="eyebrow">Error 404</p><h1>No encontramos esa página</h1><p class="lead">Puede que el enlace haya cambiado. Vuelve al inicio o escríbenos.</p><div class="hero-actions"><a class="btn btn-primary btn-lg" href="/">Ir al inicio</a>${waBtn('Escribir por WhatsApp', 'Hola YUNTRIA.IA, necesito ayuda.', 'btn btn-ghost btn-lg')}</div></div></section>` + footer();
  writeFileSync(join(ROOT, '404.html'), html);
}

function buildSeoFiles() {
  const today = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE.url}${u.path}</loc><lastmod>${u.lastmod || today}</lastmod><priority>${u.priority}</priority></url>`)
    .join('\n')}\n</urlset>\n`;
  writeFileSync(join(ROOT, 'sitemap.xml'), xml);
  writeFileSync(join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
}

/* ---------- ejecutar ---------- */
const generated = [...services.map((s) => s.slug), ...industries.map((i) => i.slug), 'chatbot-whatsapp-para-negocios', 'herramientas-ia', 'blog', 'politica-de-privacidad', 'terminos-y-condiciones'];
for (const d of generated) if (existsSync(join(ROOT, d))) rmSync(join(ROOT, d), { recursive: true, force: true });

buildHome();
services.forEach(buildService);
industries.forEach(buildIndustry);
buildChatbot();
buildTools();
buildBlog();
buildLegal();
build404();
buildSeoFiles();
console.log(`OK: ${urls.length} páginas + 404, sitemap.xml, robots.txt`);
