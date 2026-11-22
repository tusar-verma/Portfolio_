# Registro de decisiones

Formato de cada entrada:
- **#N — Título** [categoría: arquitectura | UI | contenido | rendimiento | tooling]
- **Contexto:** qué problema había
- **Decisión:** qué se eligió
- **Alternativas descartadas:** y por qué
- **Consecuencias:** qué implica
- **Código relacionado:** archivos o funciones afectadas
- **Estado:** vigente | reemplazada por #N

---

## #1 — Contenido en archivos con capa de acceso única
**Contexto:** Quiero agregar proyectos fácil y, más adelante, tener un
admin panel sin recompilar.
**Decisión:** Metadatos en `meta.json` + descripción en MDX, validados con
Zod. Todo acceso pasa por `src/lib/projects.ts`.
**Consecuencias:** Migrar a DB/CMS = reimplementar `projects.ts` (y usar
revalidación en vez de build estático puro). Los componentes no cambian.
**Estado:** vigente

## #2 — shadcn/ui + Tailwind para UI
**Contexto:** Necesito componentes accesibles y personalizables rápido.
**Decisión:** shadcn/ui sobre Tailwind.
**Consecuencias:** Los componentes viven en el repo y se editan libremente.
**Estado:** vigente

## #3 — i18n con `[lang]` como root layout
**Contexto:** El sitio es bilingüe (ES/EN) y Next 16 trae `next/root-params`,
que solo funciona si el segmento de idioma está por encima del root layout.
**Decisión:** `src/app/[lang]/layout.tsx` es el root layout, con
`generateStaticParams` devolviendo `es` y `en`. El atributo `lang` y los
componentes compartidos leen el idioma con `lang()` de `next/root-params`.
La redirección de rutas sin locale vive en `src/proxy.ts`.
**Consecuencias:** No hay `middleware.ts` (deprecado en 16). El 404 global
queda sin layout (ver #5). Agregar un idioma = sumar un valor a `locales`,
un diccionario y el contenido del proyecto.
**Estado:** vigente

## #4 — Proxy de idioma sin dependencias
**Contexto:** Había que elegir idioma en el edge sin sumar peso ni
dependencias, y sin romper assets estáticos.
**Decisión:** Parsear `Accept-Language` a mano (orden de preferencia, sin
interpretar `q=`) con fallback a `es`. El matcher excluye `_next` y cualquier
ruta con extensión (`/papers/*.pdf`, favicon, robots.txt).
**Consecuencias:** Simple y suficiente para dos idiomas. Si se suman más
locales, conviene parsear los pesos o usar `intl-localematcher`.
**Estado:** vigente

## #5 — 404 de URLs inexistentes con el default de Next
**Contexto:** Con el root layout bajo `[lang]`, `[lang]/not-found.tsx` cubre
las llamadas a `notFound()`, pero no las URLs que no matchean ninguna ruta:
esas usan el 404 interno de Next, sin `<html lang>` ni estilos del sitio.
**Decisión:** Aceptarlo durante el esqueleto y evaluar `global-not-found.tsx`
(experimental) en la fase de SEO, cuando se defina la estrategia de idioma
para ese caso.
**Consecuencias:** El 404 de URLs inexistentes no respeta el diseño ni el
idioma; el de `notFound()` sí. Requiere `experimental.globalNotFound` en
`next.config.ts` si se adopta.
**Estado:** vigente

## #6 — Contenido bilingüe con textos por idioma y validación en build
**Contexto:** El sitio es ES/EN, pero el contenido de cada proyecto no puede
duplicar la estructura en dos carpetas ni quedar desincronizado.
**Decisión:** `meta.json` guarda los textos como `{ es, en? }` y la
descripción larga vive en `index.mdx` (español) e `index.en.mdx` (inglés
opcional) dentro de la misma carpeta. `projectMetaSchema` es `strictObject`:
un campo desconocido falla el build. La capa de contenido valida además que
existan portada, MDX base y PDF, y acumula todos los errores en un solo
mensaje. `getProjects(lang)` resuelve el idioma y ordena por año descendente
y luego por título con `localeCompare(lang)`.
**Consecuencias:** Un proyecto incompleto no llega a producción. Los
componentes nunca ven el objeto `{ es, en }`: reciben `ProjectSummary` ya
resuelto. La obligatoriedad de ambos idiomas quedó reemplazada por #8.
**Estado:** vigente (idiomas: ver #8)

## #7 — Portadas servidas por route handler desde `content/`
**Contexto:** La regla de oro pide que agregar un proyecto sea copiar una
carpeta. Si la portada viviera en `public/`, habría que duplicarla o
referenciarla con otro nombre.
**Decisión:** `cover` en `meta.json` es solo el nombre del archivo; la URL
pública la deriva `getProjects()` como `/{lang}/projects/{slug}/cover`, y un
route handler lee la imagen desde `content/projects/<slug>/` con
`Content-Type` según la extensión y `Cache-Control` de un día.
**Consecuencias:** El handler es dinámico (no se prerenderiza), pero se sirve
con caché de borde/navegador. El `lang` de la URL no cambia la imagen: está
para poder usar rutas relativas al idioma activo.
**Estado:** vigente

## #8 — Contenido en español, traducción al inglés opcional
**Contexto:** Casi todo el material de los proyectos está en español y
traducirlo ahora produciría versiones apuradas o de máquina. Pero el sitio
tiene que seguir siendo navegable en `/en`.
**Decisión:** El español es obligatorio y el inglés opcional por proyecto
(`title.en`, `summary.en`, `index.en.mdx`, `paperUrlEn`). Si falta, `/en`
muestra el contenido en español con un aviso ("Solo en español" en el
listado, aviso en la ficha). Si existe `index.en.mdx`, se exigen `title.en` y
`summary.en` para no mezclar idiomas en una misma tarjeta. El repo y el PDF
no se traducen.
**Consecuencias:** Publicar un proyecto no exige traducirlo; agregar la
traducción después es solo contenido, sin cambios de código. El sitio en
inglés puede mostrar títulos en español: es una decisión explícita, no un
fallo. Se descartó traducir con máquina y se descartó ocultar proyectos sin
traducción del listado en inglés.
**Estado:** vigente

## #9 — Ficha con MDX y 404 correcto desde el primer hit
**Contexto:** La ficha tenía que renderizar MDX sin sumar un tema de
tipografía paralelo, y con Partial Prefetching un slug desconocido devolvía
200 en la primera request y recién después 404 (soft 404, con el documento
de error de Next en lugar del 404 del sitio).
**Decisión:** `MdxContent` envuelve `MDXRemote` de `next-mdx-remote/rsc` con
un mapa propio de elementos (títulos, párrafos, listas, citas, código,
links), sin `@tailwindcss/typography`. La ficha exporta
`ensureStatic = "navigation"` y `generateStaticParams` con los slugs de
`getProjects("es")`; un slug inexistente llama `notFound()`.
**Consecuencias:** Las fichas se prerenderizan (`○ /es/projects/<slug>` y
`○ /en/projects/<slug>`) y un slug desconocido responde 404 desde la primera
request. Si el MDX empieza a usar tablas, imágenes o notas al pie, hay que
agregarlas al mapa de `MdxContent`. `generateStaticParams` no puede devolver
`[]`: el sitio debe publicar al menos un proyecto.
**Estado:** vigente

## #10 — Tema claro/oscuro con script bloqueante propio [categoría: UI]
**Contexto:** Se pidió soportar tema oscuro sin flash (FOUC) ni warnings. Hubo
dos intentos previos: (1) un `ThemeProvider` propio que aplicaba la clase en un
`useEffect` (corre después del paint → FOUC); (2) `next-themes`, que resolvía el
FOUC pero en React 19 / Next 16 renderiza su `<script>` dentro de un Client
Component y dispara el warning "Encountered a script tag while rendering React
component".
**Decisión:** Un `ThemeScript` propio: un `<script>` inline en el `<body>` del
layout raíz que corre durante la carga del HTML, antes de hidratar (no hay
FOUC). Para evitar el warning de React 19 ("Encountered a script tag while
rendering React component") se usa el **patrón oficial de Next.js** (guía
"preventing flash before hydration"): el script lleva `type="text/javascript"`
en el servidor (ejecuta) y `type="text/plain"` en el cliente (React no lo trata
como script), con `suppressHydrationWarning` para absorber la diferencia de
`type`. Lee `localStorage.theme` (`light`/`dark`/`system`) y, si falta o es
`system`, usa `prefers-color-scheme`; solo togglea la clase `dark` (claro es el
`:root` por defecto). El `ThemeToggle` es un Client Component autocontenido que
persiste la preferencia y togglea la clase; retrasa su render hasta `mounted`
para no romper la hidratación en `aria-pressed`. `<html>` también lleva
`suppressHydrationWarning` porque el script muta su clase antes de hidratar. Se
desinstaló `next-themes`.
**Alternativas descartadas:** `next-themes` (renderiza su `<script>` en un
Client Component → warning en React 19). Un `<script>` común sin el truco de
`type` (también dispara el warning, aunque lo renderice un Server Component).
Deshabilitar la regla de ESLint (tapa el síntoma, no es el patrón correcto).
Provider propio con la clase en `useEffect` (FOUC).
**Consecuencias:** Sin flash ni warnings, sin `eslint-disable`. El `.dark` de
`globals.css` ya tenía las variables, así que es solo orquestación. El `content`
del script es un literal fijo (no entra input de usuario), así que
`dangerouslySetInnerHTML` no agrega superficie de XSS. El toggle vive en el
header (ver #12).
**Código relacionado:** `src/components/theme/theme-script.tsx`,
`src/components/theme/theme-toggle.tsx`, `src/app/[lang]/layout.tsx`
(`suppressHydrationWarning` + `ThemeScript`).
**Estado:** vigente

## #11 — Filtros por `searchParams` con el shell estático [categoría: arquitectura]
**Contexto:** El listado necesita filtrar por tema y año. Tenía que ser
compartible por URL, funcionar sin JavaScript y no volver dinámica a toda la
página (que hoy se prerenderiza por locale).
**Decisión:** Los filtros viajan en la query (`?tag=...&year=...`). Cada opción
es un `<Link>` cuyo `href` ya trae el `searchParams` resultante (toggle que
conserva el otro filtro), así filtrar es navegar: sin estado de cliente ni
`"use client"`. El encabezado del listado queda como shell estático y la parte
que lee `searchParams` (`ProjectsExplorer`) vive bajo `<Suspense>`, de modo que
Partial Prerendering prerenderiza el shell y resuelve solo el explorador por
request. Las facetas (tags/años con su conteo) se calculan combinando con el
otro filtro activo y se ocultan las que quedarían en cero.
**Alternativas descartadas:** Estado de cliente con `useState` (rompe sin JS y
no es compartible). Volver toda la página dinámica (pierde el prerender del
shell). Guardar el filtro en el pathname (más rutas que mantener; la query es
el lugar natural de un filtro opcional).
**Consecuencias:** `/projects` pasa de estático puro (`○`) a Partial Prerender
(`◐`): el shell sigue prerenderizado y el bloque de filtros se transmite. La
opción activa se marca con `aria-current`. Agregar proyectos con nuevos tags o
años no toca código: las facetas se derivan de `getProjects`.
**Código relacionado:** `src/app/[lang]/(site)/projects/page.tsx`
(`ProjectsExplorer` + `<Suspense>`), `src/components/filter-bar.tsx`,
`src/components/project-grid.tsx`, `src/components/empty-state.tsx`.
**Estado:** reemplazada por #13 (se quitaron los filtros).

## #12 — Diccionarios de UI con carga perezosa y chrome bilingüe [categoría: arquitectura]
**Contexto:** El chrome (header, footer, selectores) y la home tenían textos
hardcodeados por idioma dispersos en objetos `copy`. Hacía falta una única
fuente de verdad para la UI, y un selector de idioma que no te devolviera al
inicio al cambiar de idioma.
**Decisión:** Los textos de UI viven en `src/i18n/dictionaries/es.ts` y
`en.ts`. El español es la fuente de verdad: `Dictionary = typeof es` (sin
`as const`, para que sean `string` y no literales) y `en` se tipa como
`Dictionary`, así que si falta o sobra una clave, el build falla.
`get-dictionary.ts` (marcado `server-only`) los carga con `import()` dinámico
para separarlos por chunk. Los Server Components del chrome leen el diccionario;
los Client Components (`LocaleSwitcher`, `ThemeToggle`) reciben solo los textos
que necesitan por prop, nunca el diccionario entero. El `LocaleSwitcher` usa
`usePathname` y reemplaza solo el segmento de idioma, conservando el resto de
la ruta. Navega con `<a>` (recarga completa), no con `<Link>` (soft): como
`[lang]` es el layout raíz (#3), una navegación soft re-renderizaría el `<html>`
y el `ThemeScript` en el cliente, lo que dispara el warning de `<script>` de
React 19 y, además, hace que React repinte `<html>` sin la clase `dark` (el tema
se resetea a claro). Regla general: **ningún `<Link>` debe cruzar de idioma**;
por eso también se quitó el link "leerlo en español" de la ficha (#8). El único
cambio de locale es el selector, con `<a>`. Recargar es, de paso, lo correcto al
cambiar el idioma del documento.
**Alternativas descartadas:** `next-intl`/`next-i18next` (peso y complejidad
innecesarios para dos idiomas y textos acotados). Pasar el diccionario completo
a los Client Components (filtraría todo el bundle de textos al cliente).
Mantener los `copy` inline (se desincronizan y repiten).
**Consecuencias:** Agregar un idioma es sumar un diccionario y un valor en
`locales`. El contenido de proyectos sigue aparte (ver #6/#8): el diccionario
es solo para la UI. El `ThemeToggle` ahora recibe sus textos; su barra
provisional del layout (#10) se reemplazó por el header definitivo. La copia
del listado de `projects/page.tsx` todavía es inline: se migrará al extender el
diccionario (no era parte de este corte).
**Código relacionado:** `src/i18n/dictionaries/es.ts`, `src/i18n/dictionaries/en.ts`,
`src/i18n/get-dictionary.ts`, `src/components/site-header.tsx`,
`src/components/site-footer.tsx`, `src/components/locale-switcher.tsx`,
`src/app/[lang]/(site)/layout.tsx`, `src/app/[lang]/(site)/page.tsx`,
`src/components/theme/theme-toggle.tsx`.
**Estado:** vigente (el header/footer evolucionaron en #13)

## #13 — Listado como timeline vertical por año, sin filtros [categoría: UI]
**Contexto:** El listado en grilla con filtros (#11) se sentía de "portal de
noticias" y, con 5–6 proyectos, los filtros sobraban. Se pidió una lista
vertical ordenada siempre por fecha, con una línea de tiempo por año en
paralelo, y un chrome menos genérico.
**Decisión:** El listado es una lista vertical agrupada por año
(`ProjectTimeline`): una columna-eje con el año y una línea vertical, y cada
proyecto con título, descripción corta y enlaces a código e informe. Se
quitaron los filtros y todo el andamiaje de `searchParams`/`<Suspense>`, así
que `/projects` vuelve a ser estático puro (`○`). Se eliminaron `filter-bar`,
`project-grid` y `empty-state`. En el chrome: el header ya no muestra el
genérico "Portfolio" sino el nombre real (placeholder en `src/lib/profile.ts`);
el footer se reduce a los enlaces de GitHub y correo (también en `profile.ts`).
Los datos personales (nombre, GitHub, correo) se centralizan en `profile.ts`
como placeholders, separados de los textos de UI (diccionarios) porque no se
traducen.
**Alternativas descartadas:** Mantener la grilla con portadas (se pidió lista de
texto). Conservar los filtros (innecesarios con pocos proyectos; la fecha
alcanza). Hardcodear nombre/contacto en los componentes (se repiten y cuesta
completarlos después).
**Consecuencias:** `/projects` vuelve a `○`. El trabajo de #11 (filtros) queda
retirado. El contenido real (nombre, "sobre mí", contacto) queda como
placeholder hasta el rediseño. El cómo-agregar-proyecto se documentó en
`docs/agregar-proyecto.md`.
**Código relacionado:** `src/components/project-timeline.tsx`,
`src/app/[lang]/(site)/projects/page.tsx`, `src/lib/profile.ts`,
`src/components/site-header.tsx`, `src/components/site-footer.tsx`.
**Estado:** vigente

## #14 — SEO técnico: metadata por locale, sitemap y robots [categoría: arquitectura]
**Contexto:** El sitio necesitaba metadata correcta por idioma (title,
description, canonical, hreflang, OpenGraph) más sitemap y robots, sin
desincronizar las URLs ni perder el prerender estático.
**Decisión:** La URL base vive en `src/lib/site.ts` (`NEXT_PUBLIC_SITE_URL` con
fallback a localhost). El layout raíz pasó de `metadata` estático a
`generateMetadata` por idioma: fija `metadataBase`, el template de `title`
(`%s · <nombre>`, con el nombre de `profile.ts`), la descripción por idioma
(`siteDescription` del diccionario) y los defaults de OpenGraph/Twitter. El
canonical y los `hreflang` se centralizan en `alternatesFor(lang, path)`
(`src/lib/seo.ts`), que arma canonical del idioma activo + `languages` con todos
los locales y `x-default` al idioma por defecto; lo usan home, listado y ficha.
La ficha agrega OpenGraph `article` con la portada como `og:image` (la URL
relativa se absolutiza con `metadataBase`). El `sitemap.ts` emite una entrada
por URL localizada con sus alternates, y `robots.ts` apunta al sitemap.
**Alternativas descartadas:** Hardcodear la URL (no sirve entre entornos). Poner
canonical/hreflang en el layout (aplicaría el mismo canonical a todas las
páginas). `lastModified` en el sitemap (`new Date()` no se puede prerenderizar
con Cache Components; es opcional). Confiar en que la ficha herede el OpenGraph
del layout (Next **reemplaza**, no mergea, el objeto `openGraph`: por eso la
ficha repite `siteName` y `locale`).
**Consecuencias:** Cada página expone canonical + hreflang correctos y el
sitemap lista ambos idiomas y todas las fichas. Falta fijar
`NEXT_PUBLIC_SITE_URL` en producción (hoy localhost). Una imagen OG dedicada por
proyecto podría mejorar el share (hoy se usa la portada 1200×630).
**Código relacionado:** `src/lib/site.ts`, `src/lib/seo.ts`,
`src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/[lang]/layout.tsx`,
`src/app/[lang]/(site)/page.tsx`,
`src/app/[lang]/(site)/projects/page.tsx`,
`src/app/[lang]/(site)/projects/[slug]/page.tsx`.
**Estado:** vigente

## #15 — Descripción larga (`index.mdx`) opcional [categoría: contenido]
**Contexto:** Al cargar los proyectos reales, algunos se quedan solo con el
resumen (`summary`) y no tienen una descripción larga. El diseño ya anticipaba
que la ficha tuviera "una descripción más larga si es que se requiere".
**Decisión:** `index.mdx` pasa a ser opcional. `assertProjectAssets` ya no lo
exige (sí portada y PDF); `readProjectSource` lo lee solo si existe, y
`ProjectDetail.content`/`contentLanguage` son opcionales. La ficha solo
renderiza el bloque MDX y el aviso de idioma cuando hay contenido. La
consistencia del inglés se mantiene: si existe `index.en.mdx`, siguen siendo
obligatorios `title.en` y `summary.en`.
**Alternativas descartadas:** Exigir siempre `index.mdx` (obligaría a inventar
texto de relleno). Duplicar el `summary` como cuerpo (redundante).
**Consecuencias:** Un proyecto puede publicarse con solo metadatos + resumen
(ej. `redes-tp`). La portada y el PDF siguen siendo obligatorios.
**Código relacionado:** `src/lib/projects-fs.ts`, `src/lib/projects.ts`,
`src/lib/schema.ts`, `src/app/[lang]/(site)/projects/[slug]/page.tsx`.
**Estado:** vigente

## #16 — Sitio de una sola página, paleta slate+azul y chrome responsive [categoría: UI]
**Contexto:** Con pocos proyectos, una página de listado aparte sobraba. Además
el diseño se sentía poco profesional (neutros cálidos, sin acento), el header
perdía el selector de tema en pantallas chicas y los textos quedaban pegados al
borde en mobile.
**Decisión:** El sitio es **una sola página**: la home lista todos los proyectos
(no solo los destacados) como timeline por año; se eliminó
`projects/page.tsx` y el link "ver todos". Desde una ficha, el botón vuelve al
inicio (no al listado). El header ya no lleva nombre ni navegación: solo el
selector de idioma y el de tema, alineados a la derecha y con `flex-wrap` para
no cortarse en mobile. El footer centra sus enlaces (GitHub, LinkedIn, correo)
con ícono. Paleta nueva **slate + un acento azul** (`--primary`), con
`foreground`/`muted-foreground` y el acento pensados para contraste AA; el
acento se usa con moderación: enlaces de acción, nodo del timeline y focus
rings (`--ring`). Padding horizontal responsive (`px-5 sm:px-8`) para separar
del borde en teléfonos.
**Alternativas descartadas:** Mantener el listado aparte (innecesario con 4
proyectos). Marca/nombre en el header (el nombre ya está en el hero; en el
header quedaba redundante y apretaba el mobile). Acento saturado en todo (poco
profesional; el estilo suizo usa el acento con moderación).
**Consecuencias:** `/projects` ya no existe (404); el sitemap no lo incluye. Las
fichas de proyecto siguen siendo páginas propias y se llega a ellas desde la
home. Quedan sin uso las claves `nav` y `home.allProjects` del diccionario (se
eliminaron). El timeline, antes en el listado (#13), vive ahora en la home.
**Código relacionado:** `src/app/globals.css` (paleta),
`src/app/[lang]/(site)/page.tsx`, `src/components/site-header.tsx`,
`src/components/site-footer.tsx`, `src/components/project-timeline.tsx`,
`src/app/[lang]/(site)/projects/[slug]/page.tsx`, `src/app/sitemap.ts`.
**Estado:** vigente (reemplaza el listado con filtros/página aparte de #13)