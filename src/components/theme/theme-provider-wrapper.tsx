"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Envoltorio cliente del proveedor de tema (`next-themes`).
 *
 * Se separa del layout raíz porque `next-themes` es un Client Component
 * (usa contexto y efectos) y el layout raíz es un Server Component.
 *
 * `next-themes` inyecta un script bloqueante en `<head>` que fija la clase
 * `light`/`dark` en `<html>` antes del primer paint, por eso no hay flash de
 * tema (FOUC). Requiere `suppressHydrationWarning` en `<html>` (ver layout).
 *
 * Ver docs/decisions.md #10.
 */
export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
