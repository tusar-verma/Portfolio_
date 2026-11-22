import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getProjects } from "@/lib/projects";
import { profile } from "@/lib/profile";
import { alternatesFor } from "@/lib/seo";
import { ContactLinks } from "@/components/contact-links";
import {
  ProjectTimeline,
  type ProjectTimelineLabels,
} from "@/components/project-timeline";

/**
 * Metadata de la home en `/[lang]`.
 *
 * Usa el título y la descripción por defecto del layout; solo agrega el
 * canonical y los `hreflang` de la raíz del idioma.
 */
export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  return { alternates: alternatesFor(lang, "") };
}

/**
 * Home del sitio en `/[lang]` — única página del sitio.
 *
 * Dos secciones: "sobre mí" (nombre + bio) y todos los proyectos como línea de
 * tiempo por año. Como hay pocos proyectos, se listan todos acá y no hay página
 * de listado aparte (ver docs/decisions.md #16). Los textos salen del
 * diccionario y los datos personales de `src/lib/profile.ts`; los proyectos, de
 * `getProjects(lang)`. Es estática: ambos locales se prerenderizan.
 */
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;

  // Defensa por si se llega sin pasar por el proxy (request RSC directa).
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const home = dict.home;
  const projects = await getProjects(lang);

  const labels: ProjectTimelineLabels = {
    code: dict.projects.code,
    paper: dict.projects.paper,
    spanishOnly: dict.projects.spanishOnly,
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-28 px-5 py-20 sm:gap-36 sm:px-8">
      {/* Sobre mí */}
      <section className="flex flex-col gap-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {home.aboutEyebrow}
        </p>
        <h1 className="font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
          {profile.name}
        </h1>
        <div className="flex max-w-2xl flex-col gap-4 text-lg text-muted-foreground">
          {home.aboutBody.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {/* Encontrame en: (contacto) */}
        <div className="mt-2 flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {home.contactLabel}
          </p>
          <ContactLinks labels={dict.footer} />
        </div>
      </section>

      {/* Proyectos */}
      <section className="flex flex-col gap-10">
        <h2 className="border-b border-border pb-6 font-heading text-2xl leading-snug tracking-tight sm:text-3xl">
          {home.projectsTitle}
        </h2>

        {projects.length > 0 && (
          <ProjectTimeline projects={projects} lang={lang} labels={labels} />
        )}
      </section>
    </div>
  );
}
