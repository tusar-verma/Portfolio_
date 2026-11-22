import type { Dictionary } from "@/i18n/dictionaries/es";
import { profile } from "@/lib/profile";

/**
 * Íconos de marca inline (estilo fill, viewBox 24×24, `currentColor`).
 *
 * Se definen acá —y no con `lucide-react`— porque esta versión de lucide ya no
 * exporta los íconos de marca (`Github`, `Linkedin`). Se exportan para que el
 * footer también los use sin duplicarlos. Ver docs/decisions.md #16 y #17.
 */
export function GithubIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function LinkedinIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function MailIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M1.5 5.25A2.25 2.25 0 0 1 3.75 3h16.5a2.25 2.25 0 0 1 2.25 2.25v.38l-10.5 6.3-10.5-6.3v-.38Zm0 2.13v11.37A2.25 2.25 0 0 0 3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V7.38l-10.11 6.06a.75.75 0 0 1-.78 0L1.5 7.38Z" />
    </svg>
  );
}

/** Los tres enlaces de contacto, derivados de `profile` (no se traducen). */
function contactLinks(labels: Dictionary["footer"]) {
  return [
    { href: profile.githubUrl, label: labels.github, Icon: GithubIcon, external: true },
    { href: profile.linkedinUrl, label: labels.linkedin, Icon: LinkedinIcon, external: true },
    { href: `mailto:${profile.email}`, label: labels.email, Icon: MailIcon, external: false },
  ];
}

/**
 * Props de {@link ContactLinks}.
 */
interface ContactLinksProps {
  /** Textos accesibles de cada enlace (de `dict.footer`). */
  labels: Dictionary["footer"];
}

/**
 * Enlaces de contacto (GitHub, LinkedIn, correo) como "pills" con ícono.
 *
 * Versión destacada para la sección "Encontrame en" de la home (el footer usa
 * los mismos datos con un estilo más discreto). Server Component: los datos
 * salen de `src/lib/profile.ts`. Ver docs/decisions.md #17.
 */
export function ContactLinks({ labels }: ContactLinksProps) {
  return (
    <ul className="flex flex-wrap gap-3">
      {contactLinks(labels).map(({ href, label, Icon, external }) => (
        <li key={label}>
          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
