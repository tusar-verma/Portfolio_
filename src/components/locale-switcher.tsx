"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

/**
 * Props de {@link LocaleSwitcher}.
 */
interface LocaleSwitcherProps {
  /** Idioma activo; se marca como seleccionado y no navega. */
  current: Locale;
  /** Etiqueta accesible del grupo. */
  label: string;
  /** Nombre visible de cada idioma, en su propio idioma. */
  names: Record<Locale, string>;
}

/**
 * Selector de idioma que conserva la ruta actual.
 *
 * Client Component: necesita `usePathname` para saber en qué ruta está y
 * reemplazar solo el segmento de idioma (ej. `/es/projects/x` →
 * `/en/projects/x`), de modo que cambiar de idioma no te devuelve al inicio.
 * No lee el diccionario: recibe los textos por prop desde el header (Server
 * Component). Ver docs/decisions.md #12.
 */
export function LocaleSwitcher({ current, label, names }: LocaleSwitcherProps) {
  const pathname = usePathname();

  // El primer segmento de la ruta es el locale (`/es/...`). Lo reemplazo y
  // dejo el resto igual. `segments[0]` es "" por la barra inicial.
  function hrefFor(locale: Locale): string {
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/") || `/${locale}`;
  }

  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-1 text-sm"
    >
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={hrefFor(locale)}
            hrefLang={locale}
            aria-current={active ? "true" : undefined}
            className={`rounded-md px-2 py-1 transition-colors ${
              active
                ? "font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {names[locale]}
          </Link>
        );
      })}
    </div>
  );
}
