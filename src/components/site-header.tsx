import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * Props de {@link SiteHeader}.
 */
interface SiteHeaderProps {
  /** Idioma activo; lo necesita el selector de idioma. */
  lang: Locale;
  /** Diccionario de UI resuelto al idioma. */
  dict: Dictionary;
}

/**
 * Cabecera del sitio.
 *
 * Server Component minimalista: el sitio es una sola página, así que el header
 * no lleva marca ni navegación, solo los controles (selector de idioma y de
 * tema), alineados a la derecha. Usa `flex-wrap` para que en pantallas chicas
 * los controles bajen en vez de cortarse. Ver docs/decisions.md #16.
 */
export function SiteHeader({ lang, dict }: SiteHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-end gap-x-4 gap-y-2 px-5 py-4 sm:px-8">
        <LocaleSwitcher
          current={lang}
          label={dict.localeSwitcher.label}
          names={dict.localeSwitcher.names}
        />
        <ThemeToggle
          labels={{
            group: dict.theme.label,
            light: dict.theme.light,
            dark: dict.theme.dark,
            system: dict.theme.system,
          }}
        />
      </div>
    </header>
  );
}
