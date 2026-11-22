import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "@/i18n/config";

/**
 * Construye los `alternates` de una página: canonical del idioma activo y
 * `hreflang` para cada locale (más `x-default` apuntando al idioma por defecto).
 *
 * Las rutas son relativas; `metadataBase` (definida en el layout raíz) las
 * vuelve absolutas. Se centraliza acá para que todas las páginas generen el
 * mismo patrón de canonical/hreflang. Ver docs/decisions.md #14.
 *
 * @param lang Idioma activo de la página.
 * @param path Ruta sin el prefijo de idioma (ej. `""`, `"/projects"`,
 * `"/projects/mi-slug"`).
 * @returns El objeto `alternates` para la metadata de la página.
 */
export function alternatesFor(
  lang: Locale,
  path = "",
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `/${locale}${path}`;
  }
  // x-default: idioma que ve quien no matchea ninguno (ver proxy y #4).
  languages["x-default"] = `/${defaultLocale}${path}`;

  return {
    canonical: `/${lang}${path}`,
    languages,
  };
}
