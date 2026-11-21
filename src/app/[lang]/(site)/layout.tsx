import type { ReactNode } from "react";
import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

/**
 * Props de {@link SiteLayout}.
 */
interface SiteLayoutProps {
  /** Contenido de la ruta activa; lo inyecta el App Router. */
  children: ReactNode;
}

/**
 * Layout de las rutas públicas, dentro de `/[lang]/(site)`.
 *
 * Arma el chrome común: skip-link (accesibilidad), header con navegación +
 * selector de idioma + selector de tema, el contenido en `<main id="contenido">`
 * (destino del skip-link) y el footer. Lee el idioma con `lang()` de
 * `next/root-params` y resuelve los textos con `getDictionary`. Es estático: el
 * root layout prerenderiza un árbol por locale. Ver docs/decisions.md #12.
 */
export default async function SiteLayout({ children }: SiteLayoutProps) {
  const locale = await lang();

  // Defensa por si se llega sin pasar por el proxy (request RSC directa).
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <>
      {/* Skip-link: oculto hasta recibir foco, salta al contenido principal. */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
      >
        {dict.skipLink}
      </a>

      <SiteHeader lang={locale} dict={dict} />

      <main id="contenido" className="flex flex-1 flex-col">
        {children}
      </main>

      <SiteFooter dict={dict} />
    </>
  );
}
