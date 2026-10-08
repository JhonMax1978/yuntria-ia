# YUNTRIA.IA

Sitio web de **YUNTRIA.IA**, consultora de inteligencia artificial para empresas en Perú y LATAM.
HTML, CSS y JavaScript puros: **sin frameworks ni build para publicar**. Todo el contenido está en español.

## Páginas (31 + 404)

- `/` Inicio
- Servicios: `/agentes-ia/`, `/automatizacion-ia/`, `/estrategia-ia/`, `/seo-inteligencia-artificial/`
- IA por industria (11): `/ia-para-abogados/`, `-restaurantes`, `-dentistas`, `-contadores`, `-call-center`, `-hoteles`, `-consultorios`, `-arquitectos`, `-inmobiliarias`, `-recursos-humanos`, `-finanzas`
- Recursos: `/chatbot-whatsapp-para-negocios/` (con chat demo interactivo), `/herramientas-ia/`
- Blog: `/blog/` (búsqueda, categorías y paginación) + 10 artículos en `/blog/<slug>/`
- Legal: `/politica-de-privacidad/`, `/terminos-y-condiciones/`
- `sitemap.xml`, `robots.txt`, `404.html`

## Estructura

```
├── index.html, <slug>/index.html   Páginas generadas (HTML estático listo para publicar)
├── css/styles.css                  Estilos (tema oscuro, móvil primero)
├── js/main.js                      Menú, FAQ, animaciones de scroll, blog, chat demo
├── assets/img/                     Favicon e imagen Open Graph
├── tools/                          Generador y contenido (solo para editar el sitio)
│   ├── build.mjs                   Plantillas y generación de páginas
│   └── data/                       config, servicios, industrias y blog
├── vercel.json                     Configuración de despliegue en Vercel
└── 404.html, sitemap.xml, robots.txt
```

## Abrir localmente

Necesitas un servidor estático (las rutas usan `/` absolutas, así que no funciona abriendo el archivo con doble clic):

```bash
python3 -m http.server 8000      # o: npx serve .
# abre http://localhost:8000
```

## Editar contenido

Los textos viven en `tools/data/*.mjs`. Después de cambiarlos, regenera las páginas (requiere Node 18+):

```bash
node tools/build.mjs
```

- **Dominio, WhatsApp y Google Analytics 4:** `tools/data/config.mjs` (`SITE.url`, `SITE.whatsapp`, `SITE.ga4`).
  Al cambiar el dominio, regenera para actualizar canonical, Open Graph y `sitemap.xml`.
- **Nuevo artículo:** añade un objeto en `tools/data/blog.mjs`.
- **Estilos y comportamiento:** `css/styles.css` y `js/main.js` (se editan directamente).

## Despliegue

Importa el repositorio en Vercel como proyecto estático (sin comando de build, directorio raíz `/`).

## Pendientes por confirmar

- Razón social para los textos legales (hoy: "razón social por confirmar").
- Dominio final y ID de Google Analytics 4.
- El número de WhatsApp (+51 926 998 623) y las cifras de cada página provienen del documento de especificación; confirma que sean los vigentes.
