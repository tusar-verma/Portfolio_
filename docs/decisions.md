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