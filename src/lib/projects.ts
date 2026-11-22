import { cacheLife, cacheTag } from "next/cache";
import { type Locale } from "@/i18n/config";
import {
  readProjectMetas,
  readProjectSource,
} from "@/lib/projects-fs";
import type {
  ProjectDetail,
  ProjectMeta,
  ProjectSummary,
} from "@/lib/schema";

/**
 * Tag de caché de la capa de contenido.
 *
 * El futuro admin lo usa para invalidar todo el listado después de guardar
 * (`revalidateTag(PROJECTS_CACHE_TAG)`), sin tocar páginas ni componentes.
 * Ver docs/decisions.md #1.
 */
export const PROJECTS_CACHE_TAG = "projects";

/**
 * Convierte los metadatos validados al contrato que consume la UI.
 *
 * Resuelve el idioma con fallback al español (el inglés es opcional por
 * proyecto), deriva la URL de la portada y marca `isTranslated` para que la
 * UI pueda avisar cuando muestra contenido sin traducir.
 *
 * @param slug Slug del proyecto.
 * @param meta Metadatos validados.
 * @param lang Idioma al que hay que resolver los textos.
 * @returns El proyecto listo para renderizar.
 */
function toSummary(
  slug: string,
  meta: ProjectMeta,
  lang: Locale,
): ProjectSummary {
  const title = meta.title[lang] ?? meta.title.es;
  const summary = meta.summary[lang] ?? meta.summary.es;

  return {
    slug,
    title,
    summary,
    isTranslated: Boolean(meta.title[lang] && meta.summary[lang]),
    year: meta.year,
    course: meta.course,
    institution: meta.institution,
    stack: meta.stack,
    tags: meta.tags,
    repoUrl: meta.repoUrl,
    paperUrl: lang === "en" ? (meta.paperUrlEn ?? meta.paperUrl) : meta.paperUrl,
    demoUrl: meta.demoUrl,
    coverUrl: `/${lang}/projects/${slug}/cover`,
    featured: meta.featured,
    status: meta.status,
  };
}

/**
 * Devuelve todos los proyectos en el idioma pedido.
 *
 * Es la única forma en que las páginas acceden al listado. Lee el contenido
 * desde disco a través de `projects-fs.ts`, lo cachea con el tag `projects` y
 * lo ordena por año descendente y luego por título.
 *
 * @param lang Idioma al que se resuelven título y resumen.
 * @returns Los proyectos ordenados para el listado.
 */
export async function getProjects(lang: Locale): Promise<ProjectSummary[]> {
  "use cache";
  cacheLife("max");
  cacheTag(PROJECTS_CACHE_TAG);

  const projects = await readProjectMetas();

  return projects
    .map(({ slug, meta }) => toSummary(slug, meta, lang))
    .sort(
      (a, b) => b.year - a.year || a.title.localeCompare(b.title, lang),
    );
}

/**
 * Devuelve un proyecto con su descripción larga en MDX.
 *
 * Si el proyecto no tiene traducción al inglés, devuelve el MDX en español y
 * lo indica en `contentLanguage`; la ficha usa ese dato para avisar.
 *
 * @param slug Slug pedido por la URL.
 * @param lang Idioma al que se resuelven los textos y el MDX.
 * @returns El proyecto, o `null` si no existe (la página responde 404).
 */
export async function getProject(
  slug: string,
  lang: Locale,
): Promise<ProjectDetail | null> {
  "use cache";
  cacheLife("max");
  cacheTag(PROJECTS_CACHE_TAG);

  const project = await readProjectSource(slug);
  if (!project) return null;

  // La descripción larga es opcional; si falta el inglés, cae al español.
  const translated = lang === "en" ? project.content.en : undefined;
  const content = translated ?? project.content.es;

  return {
    ...toSummary(project.slug, project.meta, lang),
    content,
    // Solo tiene sentido si hay descripción larga.
    contentLanguage: content ? (translated ? "en" : "es") : undefined,
  };
}
