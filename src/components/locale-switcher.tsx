"use client";

import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

/**
 * Props de {@link LocaleSwitcher}.
 */
interface LocaleSwitcherProps {
  /** Idioma activo; se marca como seleccionado. */
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
 *
 * Usa `<a>` (navegación completa) en vez de `<Link>` (navegación soft) a
 * propósito: como `[lang]` es el layout raíz (ver #3), una navegación soft
 * re-renderizaría el `<html>` y el `ThemeScript` en el cliente, lo que dispara
 * el warning de `<script>` de React 19. Una recarga completa es además lo
 * correcto al cambiar el idioma de todo el documento. Ver docs/decisions.md #12.
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
          <a
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
          </a>
        );
      })}
    </div>
  );
}
