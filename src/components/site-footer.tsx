import type { Dictionary } from "@/i18n/dictionaries/es";
import { profile } from "@/lib/profile";

/**
 * Props de {@link SiteFooter}.
 */
interface SiteFooterProps {
  /** Diccionario de UI resuelto al idioma (solo textos de los enlaces). */
  dict: Dictionary;
}

/**
 * Pie del sitio.
 *
 * Server Component minimalista: solo el link a GitHub y el correo, tomados de
 * `src/lib/profile.ts` (placeholders hasta que se completen). Sin año (ver #10:
 * `new Date()` no se puede prerenderizar) ni nota de "hecho con". Se usa en el
 * layout de `(site)`.
 */
export function SiteFooter({ dict }: SiteFooterProps) {
  return (
    <footer className="mt-auto border-t border-border">
      <nav
        aria-label={dict.footer.github}
        className="mx-auto flex w-full max-w-5xl items-center gap-6 px-6 py-8 text-sm text-muted-foreground"
      >
        <a
          href={profile.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 transition-colors hover:text-foreground"
        >
          {dict.footer.github}
        </a>
        <a
          href={`mailto:${profile.email}`}
          className="underline underline-offset-4 transition-colors hover:text-foreground"
        >
          {dict.footer.email}
        </a>
      </nav>
    </footer>
  );
}
