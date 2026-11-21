"use client";

import { ThemeProvider } from "@/components/theme/theme-provider";
import type { ReactNode } from "react";

/**
 * Envoltorio cliente que provee el contexto de tema a toda la aplicación.
 *
 * Se separa del layout raíz porque `ThemeProvider` usa `useState` y
 * `useEffect` (es un Client Component), y el layout raíz es un Server Component.
 * Este componente se renderiza en el cliente y evita el flash de tema
 * incorrecto leyendo `localStorage` antes del primer paint.
 */
export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={true}
    >
      {children}
    </ThemeProvider>
  );
}