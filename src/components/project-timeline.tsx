import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { ProjectSummary } from "@/lib/schema";

/**
 * Etiquetas de texto del timeline, ya resueltas al idioma.
 *
 * Se pasan por prop para que el componente no dependa del sistema de textos.
 */
export interface ProjectTimelineLabels {
  /** Texto del link al repositorio. */
  code: string;
  /** Texto del link al informe PDF. */
  paper: string;
  /** Aviso cuando el proyecto solo está en español. */
  spanishOnly: string;
}

/**
 * Props de {@link ProjectTimeline}.
 */
interface ProjectTimelineProps {
  /** Proyectos a mostrar, ya ordenados por año descendente por `getProjects`. */
  projects: ProjectSummary[];
  /** Idioma activo; arma los links a la ficha. */
  lang: Locale;
  /** Textos resueltos al idioma. */
  labels: ProjectTimelineLabels;
}

/**
 * Listado vertical de proyectos como línea de tiempo por año.
 *
 * Agrupa los proyectos por año (una columna-eje a la izquierda con el año y una
 * línea vertical) y lista cada uno con título, descripción corta y los enlaces
 * al código y al informe. Server Component puro: recibe los proyectos ya
 * resueltos y ordenados por `src/lib/projects.ts`. Se usa en `/[lang]/projects`.
 * Ver docs/decisions.md #13.
 */
export function ProjectTimeline({ projects, lang, labels }: ProjectTimelineProps) {
  // Agrupo por año conservando el orden (getProjects ya ordena por año desc).
  const groups: { year: number; items: ProjectSummary[] }[] = [];
  for (const project of projects) {
    const last = groups.at(-1);
    if (last && last.year === project.year) last.items.push(project);
    else groups.push({ year: project.year, items: [project] });
  }

  return (
    <ol className="flex flex-col">
      {groups.map((group) => (
        <li
          key={group.year}
          className="grid grid-cols-[3rem_1fr] gap-x-6 sm:grid-cols-[5rem_1fr] sm:gap-x-10"
        >
          {/* Eje del timeline: el año. */}
          <div className="pt-1 text-right">
            <span className="font-mono text-sm font-medium text-muted-foreground">
              {group.year}
            </span>
          </div>

          {/* Proyectos del año, con la línea vertical a la izquierda. */}
          <div className="flex flex-col gap-10 border-l border-border pb-14 pl-6 sm:pl-10">
            {group.items.map((project) => (
              <article
                key={project.slug}
                className="relative flex flex-col gap-2"
              >
                {/* Nodo sobre la línea. */}
                <span
                  aria-hidden="true"
                  className="absolute -left-6 top-2 size-2 -translate-x-1/2 rounded-full bg-primary sm:-left-10"
                />
                <h2 className="font-heading text-2xl leading-snug tracking-tight">
                  <Link
                    href={`/${lang}/projects/${project.slug}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {project.title}
                  </Link>
                </h2>
                <p className="text-muted-foreground">{project.summary}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {labels.code}
                  </a>
                  <a
                    href={project.paperUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {labels.paper}
                  </a>
                  {!project.isTranslated && (
                    <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      {labels.spanishOnly}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
