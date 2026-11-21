import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getProjects } from "@/lib/projects";
import { alternatesFor } from "@/lib/seo";
import {
  ProjectTimeline,
  type ProjectTimelineLabels,
} from "@/components/project-timeline";

/**
 * Textos del listado mientras no existe el sistema de diccionarios.
 * Se migran a `src/i18n/dictionaries` cuando se extienda el diccionario.
 */
const copy = {
  es: {
    eyebrow: "Proyectos",
    title: "Trabajos de la facultad",
    description:
      "Cada proyecto incluye el repositorio con el código y el informe en PDF, ordenados del más reciente al más antiguo.",
    empty: "Todavía no hay proyectos publicados.",
    code: "Código",
    paper: "Informe",
    spanishOnly: "Solo en español",
  },
  en: {
    eyebrow: "Projects",
    title: "Coursework",
    description:
      "Every project ships with its source repository and a PDF paper, ordered from newest to oldest.",
    empty: "No projects published yet.",
    code: "Code",
    paper: "Paper",
    spanishOnly: "Spanish only",
  },
} as const;

/**
 * Metadata del listado en `/[lang]/projects`.
 *
 * Depende del idioma, por eso es `generateMetadata` y no un `metadata` fijo.
 */
export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const t = copy[lang];

  return {
    title: t.title,
    description: t.description,
    alternates: alternatesFor(lang, "/projects"),
  };
}

/**
 * Listado de proyectos en `/[lang]/projects`.
 *
 * Muestra todos los proyectos como una línea de tiempo vertical por año
 * ({@link ProjectTimeline}), ordenados por fecha descendente. Los datos salen
 * solo de `getProjects(lang)` en `src/lib/projects.ts`. Es estática: el root
 * layout prerenderiza ambos locales y la capa de contenido usa `'use cache'`.
 * Ya no tiene filtros (ver docs/decisions.md #13).
 */
export default async function ProjectsPage({
  params,
}: PageProps<"/[lang]/projects">) {
  const { lang } = await params;

  // Defensa por si se llega sin pasar por el proxy (request RSC directa).
  if (!isLocale(lang)) notFound();

  const t = copy[lang];
  const projects = await getProjects(lang);

  const labels: ProjectTimelineLabels = {
    code: t.code,
    paper: t.paper,
    spanishOnly: t.spanishOnly,
  };

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-20">
      <header className="flex flex-col gap-4 border-b border-border pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {t.eyebrow}
        </p>
        <h1 className="font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
          {t.title}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {t.description}
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="text-muted-foreground">{t.empty}</p>
      ) : (
        <ProjectTimeline projects={projects} lang={lang} labels={labels} />
      )}
    </section>
  );
}
