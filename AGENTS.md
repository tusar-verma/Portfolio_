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