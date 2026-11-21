import type { ReactNode } from "react";

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
 * Por ahora solo envuelve el contenido en `<main id="contenido">`, que es el
 * destino del skip-link y el contenedor donde la Fase 6 agrega el header y el
 * footer. Es estático: no accede a datos ni a APIs de request.
 */
export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <main id="contenido" className="flex flex-1 flex-col">
      {children}
    </main>
  );
}
