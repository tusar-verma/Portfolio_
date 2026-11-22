import type { MetadataRoute } from "next";
import { defaultLocale, locales } from "@/i18n/config";
import { getProjects } from "@/lib/projects";
import { siteUrl } from "@/lib/site";

/**
 * Sitemap del sitio en `/sitemap.xml`.
 *
 * Emite una entrada por URL localizada (home, listado y cada ficha) y, en cada
 * una, los `alternates.languages` con las versiones en los otros idiomas (más
 * `x-default`). Los slugs salen de `getProjects` (no dependen del idioma), así
 * que agregar un proyecto actualiza el sitemap sin tocar este archivo.
 *
 * Se genera en el build (estático). Sin `lastModified`: `new Date()` no se
 * puede prerenderizar con Cache Components y el dato es opcional.
 *
 * @returns La lista de URLs del sitio con sus alternates por idioma.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects(defaultLocale);

  // Rutas lógicas sin prefijo de idioma. No hay listado `/projects` (el sitio
  // es una sola página, ver #16); sí cada ficha de proyecto.
  const paths = [
    "",
    ...projects.map((project) => `/projects/${project.slug}`),
  ];

  return paths.flatMap((path) => {
    const languages = Object.fromEntries(
      locales.map((locale) => [locale, `${siteUrl}/${locale}${path}`]),
    );
    languages["x-default"] = `${siteUrl}/${defaultLocale}${path}`;

    // Una entrada por idioma, cada una con el mapa completo de alternates.
    return locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      alternates: { languages },
    }));
  });
}
