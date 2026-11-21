import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

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
 * Monta una barra mínima con el selector de tema (`ThemeToggle`) y envuelve el
 * contenido en `<main id="contenido">`, destino del skip-link. La barra es
 * provisional: la Fase 6 la reemplaza por el header/footer bilingües y mueve
 * ahí el selector. Es estático: no accede a datos ni a APIs de request.
 */
export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <>
      {/* Barra provisional hasta el header de la Fase 6. Ver docs/decisions.md #10. */}
      <div className="flex justify-end px-6 py-4">
        <ThemeToggle />
      </div>
      <main id="contenido" className="flex flex-1 flex-col">
        {children}
      </main>
    </>
  );
}
