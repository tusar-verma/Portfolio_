"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";

/**
 * Opciones del selector de tema, en orden de aparición.
 *
 * El `label` es solo para lectores de pantalla; la UI muestra el ícono.
 * Los textos están en español igual que el resto de la UI (todavía sin
 * diccionarios; se extraen en la Fase 6).
 */
const OPTIONS = [
  { value: "light", label: "Claro", Icon: Sun },
  { value: "dark", label: "Oscuro", Icon: Moon },
  { value: "system", label: "Sistema", Icon: Monitor },
] as const;

/**
 * Selector de tema con tres opciones: claro, oscuro y sistema.
 *
 * Client Component: lee y cambia el tema con `useTheme` de `next-themes`
 * (estado de cliente + localStorage). Se monta en el layout de `(site)`
 * dentro de una barra mínima hasta que la Fase 6 traiga el header definitivo.
 *
 * Retrasa el render hasta `mounted` porque `next-themes` inicializa el tema
 * en `undefined` durante el SSR: pintar los botones antes provocaría un
 * mismatch de hidratación en `aria-pressed`. Mientras tanto reserva el
 * espacio con un placeholder del mismo tamaño para no mover el layout.
 *
 * Ver docs/decisions.md #10.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // El patrón `mounted` de next-themes requiere setState tras el montaje para
  // saber que estamos en el cliente; es intencional, no un efecto evitable.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Placeholder del tamaño del control real para evitar salto de layout.
    return <div className="h-9 w-[7.5rem]" aria-hidden="true" />;
  }

  return (
    <div
      className="flex items-center gap-1 rounded-lg bg-muted p-1 text-sm"
      role="group"
      aria-label="Tema"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={`rounded-md px-3 py-1.5 text-muted-foreground transition-colors ${
              active
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50"
            }`}
            aria-pressed={active}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
