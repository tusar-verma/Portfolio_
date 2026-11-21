import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getProjects } from "@/lib/projects";
import { profile } from "@/lib/profile";
import {
  ProjectTimeline,
  type ProjectTimelineLabels,
} from "@/components/project-timeline";

/**
 * Home del sitio en `/[lang]`.
 *
 * Dos secciones: "sobre mí" (hero con el nombre y una descripción —hoy
 * placeholder lorem ipsum—) y los proyectos destacados como línea de tiempo,
 * con un link al listado completo. Los textos salen del diccionario y los datos
 * personales de `src/lib/profile.ts`; los proyectos, de `getProjects(lang)`.
 *
 * Es estática: ambos locales se prerenderizan con el `generateStaticParams`
 * del layout raíz.
 */
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;

  // Defensa por si se llega sin pasar por el proxy (request RSC directa).
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const home = dict.home;

  // En la home solo los destacados; el listado completo vive en /projects.
  const featured = (await getProjects(lang)).filter((project) => project.featured);

  const labels: ProjectTimelineLabels = {
    code: dict.projects.code,
    paper: dict.projects.paper,
    spanishOnly: dict.projects.spanishOnly,
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-20 px-6 py-20">
      {/* Sobre mí */}
      <section className="flex flex-col gap-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {home.aboutEyebrow}
        </p>
        <h1 className="font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
          {profile.name}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {home.aboutBody}
        </p>
      </section>

      {/* Proyectos destacados */}
      <section className="flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <h2 className="font-heading text-2xl leading-snug tracking-tight sm:text-3xl">
            {home.projectsTitle}
          </h2>
          <Link
            href={`/${lang}/projects`}
            className="text-sm font-medium underline underline-offset-4"
          >
            {home.allProjects}
          </Link>
        </div>

        {featured.length > 0 && (
          <ProjectTimeline projects={featured} lang={lang} labels={labels} />
        )}
      </section>
    </div>
  );
}
