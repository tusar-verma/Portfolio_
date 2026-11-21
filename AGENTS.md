<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Portfolio universitario

Sitio personal que muestra mis proyectos de la universidad. Cada proyecto
tiene un repo de código y un informe tipo paper (PDF).

## Stack
- Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind + shadcn/ui
- i18n: rutas `/[lang]` (es, en), `next/root-params` y `src/proxy.ts`
- Contenido: MDX + metadatos validados con Zod
- Deploy: TODO (Vercel probablemente)

## Regla de oro
Agregar un proyecto NUNCA debe requerir tocar componentes ni páginas.
Solo se agrega contenido en `content/projects/<slug>/` (y su PDF en
`public/papers/`).

## Arquitectura de contenido
- Las páginas y componentes acceden a los datos SOLO mediante
  `src/lib/projects.ts` (`getProjects(lang)`, `getProject(slug, lang)`).
  Prohibido leer archivos de contenido desde otro lugar.
- `src/lib/projects-fs.ts` es el adaptador de disco: lee, valida y verifica
  assets. Es interno; no se importa desde páginas ni componentes.
- Motivo: más adelante habrá un admin panel y la fuente de datos pasará
  a una base de datos / CMS. Solo debe cambiar la implementación de
  `projects.ts`, no sus consumidores.
- Los metadatos se validan con el esquema Zod de `src/lib/schema.ts`.
  Un proyecto inválido debe fallar el build con un error claro.

## Estructura

content/projects/<slug>/
meta.json # metadatos (ver schema.ts)
index.mdx # descripción larga en español (obligatorio)
index.en.mdx # traducción al inglés (opcional)
cover.png # portada, servida por route handler (no va en public/)
public/papers/<slug>.pdf # informe en español
public/papers/<slug>-en.pdf # informe en inglés (opcional)
src/lib/schema.ts # contratos y validación
src/lib/projects-fs.ts # lectura de disco (interno)
src/lib/projects.ts # API pública de contenido
src/i18n/config.ts # locales
src/proxy.ts # redirección a /es o /en
src/app/[lang]/... # rutas por idioma
src/components/... # componentes compartidos

## Idiomas
- El sitio (UI, metadata, navegación) es bilingüe ES/EN.
- El contenido de los proyectos es español por defecto. El inglés es
  opcional por proyecto: si falta, `/en` muestra el texto en español con
  un aviso "Disponible solo en español".
- Regla de consistencia: si existe `index.en.mdx`, `title` y `summary`
  deben tener `en`. Si no existe, alcanza con `es`.
- Repositorio y PDF no se traducen: se muestran tal como están.

## Campos de meta.json
title {es, en?}, summary {es, en?}, year, course, institution,
stack[], tags[], repoUrl, paperUrl, paperUrlEn?, demoUrl?, cover,
featured (bool), status ("completed" | "in-progress").

## Cómo agregar un proyecto
Usar la skill `add-project` o el agente `@project-writer`. Como mínimo:
`meta.json`, `index.mdx` (español), `cover.png` y `public/papers/<slug>.pdf`.
El inglés (`title.en`, `summary.en`, `index.en.mdx`) se agrega después,
cuando la traducción esté revisada.

## Comandos
- `npm run dev` — desarrollo
- `npm run build` — build (valida el contenido)
- `npm run lint` — ESLint
- `npx tsc --noEmit` — typecheck
- `npx next typegen` — regenera los tipos de rutas (`PageProps`, `RouteContext`)

## Convenciones
- Server Components por defecto; `"use client"` solo si hace falta.
- Imágenes con `next/image`. Metadata/SEO por página con `generateMetadata`.
- Accesibilidad: HTML semántico, contraste AA, alt en imágenes.
- Idioma: UI y metadata bilingües; contenido de proyectos en español con
  inglés opcional (ver "Idiomas"). Textos de UI fuera de diccionarios por
  ahora: al extraerlos, no cambiar la estructura de las páginas.
- Antes de terminar una tarea: correr lint, typecheck y build.

## Memoria del proyecto
- Antes de cambios de arquitectura, leer `docs/decisions.md`.
- Al tomar una decisión relevante, agregar una entrada ahí (formato abajo
  del archivo). No borrar entradas: marcarlas como reemplazadas.
- Mantener este archivo corto. Detalles largos van en skills o en docs/.

## Flujo de trabajo y git
- NO ejecutar comandos que modifiquen git (add, commit, push, checkout,
  reset, stash, merge, rebase). El control de git lo hago yo.
- Solo se permite lectura: `git status`, `git diff`, `git log`.
- Trabajar por fases pequeñas. Al terminar cada fase: resumir qué cambió
  (archivos), cómo verificarlo, y DETENERSE esperando mi aprobación.
- No avanzar a la siguiente fase sin que yo lo pida.

## Documentación en el código
- Toda función, hook, tipo, componente y página que se cree o modifique
  lleva un comentario TSDoc (`/** ... */`).

### Páginas y archivos de ruta (`page.tsx`, `layout.tsx`, `loading.tsx`,
### `error.tsx`, `not-found.tsx`, route handlers)
- Comentario al inicio del export por defecto: ruta que atiende (ej.
  `/projects/[slug]`), qué muestra, de dónde saca los datos (siempre vía
  `src/lib/projects.ts`) y si es estática, dinámica o con revalidación.
- Documentar `generateStaticParams` y `generateMetadata`: qué generan y
  por qué.

### Componentes
- Describir qué renderiza y dónde se usa.
- Documentar cada prop en su interfaz (`/** descripción */` sobre cada
  campo), incluyendo valores por defecto y si es opcional.
- Si es Client Component (`"use client"`), comentar por qué hace falta
  (estado, eventos, APIs del navegador).
- Si hay variantes o composición no obvia, agregar un `@example` corto.

### Reglas generales
- Los bloques no triviales dentro de una función (regex, transformaciones,
  workarounds, decisiones de rendimiento) llevan un comentario breve
  explicando la intención.
- El comentario explica el porqué, no repite lo que dice el código. No
  comentar lo evidente.
- Si el cambio responde a una decisión de diseño, referenciarla:
  `// Ver docs/decisions.md #3`.
- Al modificar código existente, actualizar su comentario si quedó
  desactualizado.
- Idioma de los comentarios: español.

## Decisiones de diseño
- Al terminar cada fase, agregar a `docs/decisions.md` una entrada por cada
  decisión relevante tomada (estructura, librerías, patrones, UI), con sus
  alternativas y justificación. No borrar entradas previas: marcarlas como
  reemplazadas.
- Incluir en el resumen final de la fase qué entradas se agregaron.