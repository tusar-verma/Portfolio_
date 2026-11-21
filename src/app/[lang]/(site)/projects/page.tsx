import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getProjects } from "@/lib/projects";

/**
 * Textos del listado mientras no existe el sistema de diccionarios.
 * En la Fase 6 se mueven a `src/i18n/dictionaries`.
 */
const copy = {
  es: {
    eyebrow: "Proyectos",
    title: "Trabajos de la facultad",
    description:
      "Cada proyecto incluye el repositorio con el código y el informe en PDF. Los más recientes aparecen primero.",
    empty: "Todavía no hay proyectos publicados.",
    count: (total: number) =>
      total === 1 ? "1 proyecto" : `${total} proyectos`,
    repo: "Código",
    paper: "Informe",
    spanishOnly: "Solo en español",
    status: {
      completed: "Terminado",
      "in-progress": "En curso",
    },
  },
  en: {
    eyebrow: "Projects",
    title: "Coursework",
    description:
      "Every project ships with its source repository and a PDF paper. The most recent ones come first.",
    empty: "No projects published yet.",
    count: (total: number) =>
      total === 1 ? "1 project" : `${total} projects`,
    repo: "Code",
    paper: "Paper",
    spanishOnly: "Spanish only",
    status: {
      completed: "Completed",
      "in-progress": "In progress",
    },
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
  };
}

/**
 * Listado de proyectos en `/[lang]/projects`.
 *
 * Los datos salen exclusivamente de `getProjects(lang)` en
 * `src/lib/projects.ts`, que resuelve el idioma y cachea la lectura de
 * `content/projects/`. Es estática: el layout raíz prerenderiza ambos locales
 * y la capa de contenido usa `'use cache'`.
 */
export default async function ProjectsPage({
  params,
}: PageProps<"/[lang]/projects">) {
  const { lang } = await params;

  // Defensa por si se llega sin pasar por el proxy (request RSC directa).
  if (!isLocale(lang)) notFound();

  const t = copy[lang];
  const projects = await getProjects(lang);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-20">
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
        <p className="text-sm text-muted-foreground">
          {t.count(projects.length)}
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="text-muted-foreground">{t.empty}</p>
      ) : (
        <ul className="grid gap-12 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.slug} className="flex flex-col gap-4">
              <Link
                href={`/${lang}/projects/${project.slug}`}
                className="group flex flex-col gap-4"
              >
                <div className="relative aspect-[1200/630] w-full overflow-hidden bg-muted">
                  <Image
                    src={project.coverUrl}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <span>{project.year}</span>
                  <span aria-hidden="true">·</span>
                  <span>{project.course}</span>
                  {project.status === "in-progress" && (
                    <span className="text-foreground">
                      {t.status[project.status]}
                    </span>
                  )}
                  {!project.isTranslated && (
                    <span className="border border-border px-2 py-1 tracking-[0.12em]">
                      {t.spanishOnly}
                    </span>
                  )}
                </div>

                <h2 className="font-heading text-2xl leading-snug tracking-tight underline-offset-4 group-hover:underline">
                  {project.title}
                </h2>

                <p className="text-muted-foreground">{project.summary}</p>
              </Link>

              <div className="flex flex-wrap gap-2">
                {project.stack.map((technology) => (
                  <span
                    key={technology}
                    className="border border-border px-2 py-1 text-xs text-muted-foreground"
                  >
                    {technology}
                  </span>
                ))}
              </div>

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
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
