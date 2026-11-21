import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/mdx/mdx-content";
import { isLocale } from "@/i18n/config";
import { getProject, getProjects } from "@/lib/projects";

/**
 * Textos de la ficha mientras no existe el sistema de diccionarios.
 * En la Fase 6 se mueven a `src/i18n/dictionaries`.
 */
const copy = {
  es: {
    back: "Volver a proyectos",
    course: "Materia",
    year: "Año",
    institution: "Institución",
    stack: "Stack",
    repo: "Ver código",
    paper: "Leer informe",
    demo: "Ver demo",
    noticeTitle: "Contenido en español",
    noticeBody:
      "La descripción de este proyecto todavía no tiene traducción al inglés.",
    noticeLink: "Leerlo en español",
    status: {
      completed: "Terminado",
      "in-progress": "En curso",
    },
  },
  en: {
    back: "Back to projects",
    course: "Course",
    year: "Year",
    institution: "Institution",
    stack: "Stack",
    repo: "View code",
    paper: "Read paper",
    demo: "View demo",
    noticeTitle: "Content in Spanish",
    noticeBody: "This project write-up has not been translated yet.",
    noticeLink: "Read it in Spanish",
    status: {
      completed: "Completed",
      "in-progress": "In progress",
    },
  },
} as const;

/**
 * Exige que la ficha se genere por completo antes de responder.
 *
 * Sin esto, Partial Prefetching sirve el shell con estado 200 en el primer
 * hit a un slug desconocido y recién después lo corrige a 404. Con
 * `'navigation'`, Next espera el render con los params reales, así que
 * `notFound()` responde 404 desde la primera request.
 */
export const ensureStatic = "navigation";

/**
 * Prerenderiza una ficha por proyecto.
 *
 * Los slugs no dependen del idioma, así que alcanza con leer el listado una
 * vez. Con Cache Components esta función no puede devolver `[]`: si no hay
 * proyectos, el build falla (el sitio siempre publica al menos uno).
 *
 * @returns Un objeto `{ slug }` por proyecto.
 */
export async function generateStaticParams() {
  const projects = await getProjects("es");
  return projects.map(({ slug }) => ({ slug }));
}

/**
 * Metadata de la ficha en `/[lang]/projects/[slug]`.
 *
 * Sale del proyecto ya resuelto al idioma de la URL. Si el slug no existe
 * devuelve vacío y la página responde 404.
 */
export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};

  const project = await getProject(slug, lang);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
  };
}

/**
 * Ficha de un proyecto en `/[lang]/projects/[slug]`.
 *
 * Muestra metadatos, portada, enlaces al repo y al informe, y la descripción
 * larga en MDX. Los datos salen exclusivamente de `getProject(slug, lang)` en
 * `src/lib/projects.ts`, que aplica fallback al español cuando el proyecto no
 * tiene traducción y lo informa en `contentLanguage`.
 *
 * Es estática para los slugs de `generateStaticParams`; un slug desconocido
 * responde 404 con `notFound()`.
 *
 * El contenido real se renderiza en `ProjectPageContent` dentro de un
 * `<Suspense>` para que `params` se resuelva dentro del boundary y la
 * navegación sea instantánea (sin warning de `instant-shell-url-data`).
 */
export default async function ProjectPage({
  params,
}: PageProps<"/[lang]/projects/[slug]">) {
  return (
    <Suspense fallback={<ProjectPageSkeleton />}>
      <ProjectPageContent params={params} />
    </Suspense>
  );
}

import { Suspense } from "react";

/**
 * Skeleton que se muestra mientras se resuelven los params (solo en navegación
 * a slugs no prerenderizados; los slugs de generateStaticParams ya vienen
 * completos).
 */
function ProjectPageSkeleton() {
  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="h-6 w-1/4 bg-muted animate-pulse rounded mb-8" />
      <div className="h-10 w-3/4 bg-muted animate-pulse rounded mb-4" />
      <div className="h-6 w-full bg-muted animate-pulse rounded mb-8" />
      <div className="aspect-[1200/630] w-full bg-muted animate-pulse rounded mb-10" />
      <div className="space-y-4">
        <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
        <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
        <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
      </div>
    </article>
  );
}

/**
 * Contenido real de la ficha. Recibe `params` ya como Promise y lo resuelve
 * dentro del boundary de Suspense.
 */
async function ProjectPageContent({
  params,
}: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;

  // Defensa por si se llega sin pasar por el proxy (request RSC directa).
  if (!isLocale(lang)) notFound();

  const project = await getProject(slug, lang);
  if (!project) notFound();

  const t = copy[lang];

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-16">
      <Link
        href={`/${lang}/projects`}
        className="text-sm font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
      >
        ← {t.back}
      </Link>

      <header className="mt-8 flex flex-col gap-5 border-b border-border pb-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <span>{project.year}</span>
          <span aria-hidden="true">·</span>
          <span>{project.course}</span>
          <span className="border border-border px-2 py-1 tracking-[0.12em] text-foreground">
            {t.status[project.status]}
          </span>
        </div>

        <h1 className="font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
          {project.title}
        </h1>

        <p className="text-lg text-muted-foreground">{project.summary}</p>

        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4"
          >
            {t.repo}
          </a>
          <a
            href={project.paperUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4"
          >
            {t.paper}
          </a>
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              {t.demo}
            </a>
          )}
        </div>
      </header>

      <div className="relative mt-8 aspect-[1200/630] w-full overflow-hidden bg-muted">
        <Image
          src={project.coverUrl}
          alt={project.title}
          fill
          preload
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
        />
      </div>

      {project.contentLanguage !== lang && (
        <aside className="mt-8 border border-border bg-muted/40 p-4 text-sm">
          <p className="font-semibold">{t.noticeTitle}</p>
          <p className="mt-1 text-muted-foreground">{t.noticeBody}</p>
          <Link
            href={`/es/projects/${project.slug}`}
            className="mt-2 inline-block underline underline-offset-4"
          >
            {t.noticeLink}
          </Link>
        </aside>
      )}

      <dl className="mt-10 grid gap-6 border-y border-border py-6 text-sm sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t.institution}
          </dt>
          <dd>{project.institution}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t.course}
          </dt>
          <dd>{project.course}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t.year}
          </dt>
          <dd>{project.year}</dd>
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t.stack}
          </dt>
          <dd className="flex flex-wrap gap-2">
            {project.stack.map((technology) => (
              <span
                key={technology}
                className="border border-border px-2 py-1 text-xs text-muted-foreground"
              >
                {technology}
              </span>
            ))}
          </dd>
        </div>
      </dl>

      <div className="mt-10">
        <MdxContent source={project.content} />
      </div>
    </article>
  );
}
