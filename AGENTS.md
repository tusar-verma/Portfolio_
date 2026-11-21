<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Portfolio universitario

Sitio personal que muestra mis proyectos de la universidad. Cada proyecto
tiene un repo de código y un informe tipo paper (PDF).

## Stack
- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Contenido: MDX + metadatos validados con Zod
- Deploy: TODO (Vercel probablemente)

## Regla de oro
Agregar un proyecto NUNCA debe requerir tocar componentes ni páginas.
Solo se agrega contenido en `content/projects/<slug>/`.

## Arquitectura de contenido
- Las páginas y componentes acceden a los datos SOLO mediante
  `src/lib/projects.ts` (`getProjects()`, `getProject(slug)`).
  Prohibido leer archivos de contenido desde otro lugar.
- Motivo: más adelante habrá un admin panel y la fuente de datos pasará
  a una base de datos / CMS. Solo debe cambiar la implementación de
  `projects.ts`, no sus consumidores.
- Los metadatos se validan con el esquema Zod de `src/lib/schema.ts`.
  Un proyecto inválido debe fallar el build con un error claro.

## Estructura

content/projects/<slug>/
meta.json # metadatos (ver schema.ts)
index.mdx # descripción larga: problema, enfoque, resultados
cover.png
public/papers/<slug>.pdf
src/lib/schema.ts
src/lib/projects.ts
src/app/(site)/...
src/components/...


## Campos de meta.json
title, summary, year, course, institution, role, stack[], tags[],
repoUrl, paperUrl, demoUrl?, cover, featured (bool), status
("completed" | "in-progress").

## Cómo agregar un proyecto
Usar la skill `add-project` o el agente `@project-writer`.

## Comandos
- `npm run dev` — desarrollo
- `npm run build` — build (valida el contenido)
- `npm run lint` — ESLint
- `npx tsc --noEmit` — typecheck

## Convenciones
- Server Components por defecto; `"use client"` solo si hace falta.
- Imágenes con `next/image`. Metadata/SEO por página con `generateMetadata`.
- Accesibilidad: HTML semántico, contraste AA, alt en imágenes.
- Idioma del sitio: TODO (definir; dejar textos fáciles de extraer para i18n).
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