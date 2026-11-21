import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/es";
import { profile } from "@/lib/profile";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * Props de {@link SiteHeader}.
 */
interface SiteHeaderProps {
  /** Idioma activo; arma los links internos y el selector de idioma. */
  lang: Locale;
  /** Diccionario de UI resuelto al idioma. */
  dict: Dictionary;
}

/**
 * Cabecera del sitio.
 *
 * Server Component: muestra la marca (link al inicio), la navegación y, a la
 * derecha, el selector de idioma y el de tema. Todos los textos salen del
 * diccionario (`dict`); el selector de idioma y el de tema son Client
 * Components y reciben sus textos por prop. Se usa en el layout de `(site)`.
 */
export function SiteHeader({ lang, dict }: SiteHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-5">
        <Link
          href={`/${lang}`}
          className="font-heading text-lg font-semibold tracking-tight"
        >
          {/* Nombre real (placeholder) en vez de "Portfolio". Ver profile.ts. */}
          {profile.name}
        </Link>

        <div className="flex items-center gap-6">
          <nav aria-label={dict.nav.home}>
            <ul className="flex items-center gap-5 text-sm font-medium">
              <li>
                <Link
                  href={`/${lang}`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {dict.nav.home}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/projects`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {dict.nav.projects}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-3">
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
        </div>
      </div>
    </header>
  );
}
