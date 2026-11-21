import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";

/**
 * Copia temporal de la home mientras no existe el sistema de diccionarios.
 * En la Fase 6 se mueve a `src/i18n/dictionaries`.
 */
const copy = {
  es: {
    eyebrow: "Portafolio universitario",
    title: "Proyectos de la facultad, con el código y el informe de cada trabajo.",
    description:
      "Un recorrido por los trabajos de la facultad, con el código y el informe de cada uno.",
    note: "Fase 2 completada: capa de contenido validada y listado de proyectos.",
    projectsLabel: "Ver proyectos",
    switchLabel: "View in English",
  },
  en: {
    eyebrow: "University portfolio",
    title: "Coursework projects, with the code and the paper behind each one.",
    description:
      "A walk through my coursework, with the code and the paper behind each one.",
    note: "Phase 2 done: validated content layer and project listing.",
    projectsLabel: "See projects",
    switchLabel: "Ver en español",
  },
} as const;

/**
 * Home del sitio en `/[lang]`.
 *
 * Placeholder de la Fase 1: muestra un mensaje por idioma y un link al otro
 * locale. Todavía no lee proyectos; en la Fase 9 pasa a mostrar los
 * destacados vía `getProjects(lang)` de `src/lib/projects.ts`.
 *
 * Es estática: ambos locales se prerenderizan con el `generateStaticParams`
 * del layout raíz.
 */
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;

  // Defensa por si se llega sin pasar por el proxy (por ejemplo, una request
  // RSC directa): evita indexar una copia inexistente y responde 404.
  if (!isLocale(lang)) notFound();

  const t = copy[lang];
  const otherLocale = lang === "es" ? "en" : "es";

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-6 py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {t.eyebrow}
      </p>
      <h1 className="font-heading text-4xl leading-tight tracking-tight sm:text-5xl">
        {t.title}
      </h1>
      <p className="max-w-xl text-lg text-muted-foreground">{t.description}</p>
      <p className="text-sm text-muted-foreground">{t.note}</p>
      <div className="flex flex-wrap items-center gap-6">
        <Link
          href={`/${lang}/projects`}
          className="text-sm font-medium underline underline-offset-4"
        >
          {t.projectsLabel}
        </Link>
        <Link
          href={`/${otherLocale}`}
          className="text-sm font-medium underline underline-offset-4"
        >
          {t.switchLabel}
        </Link>
      </div>
    </section>
  );
}
