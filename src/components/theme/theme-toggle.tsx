"use client";

import { useTheme } from "@/components/theme/theme-provider";
import { Moon, Sun, Monitor } from "lucide-react";

/**
 * Selector de tema con tres opciones: claro, oscuro y sistema.
 *
 * Se usa en el header (Fase 6). Por ahora se exporta para que esté disponible.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1 text-sm" role="group" aria-label="Tema">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`rounded-md px-3 py-1.5 text-muted-foreground transition-colors ${
          theme === "light"
            ? "bg-background text-foreground shadow-sm"
            : "hover:bg-background/50"
        }`}
        aria-pressed={theme === "light"}
      >
        <Sun className="size-4" aria-hidden="true" />
        <span className="sr-only">Claro</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`rounded-md px-3 py-1.5 text-muted-foreground transition-colors ${
          theme === "dark"
            ? "bg-background text-foreground shadow-sm"
            : "hover:bg-background/50"
        }`}
        aria-pressed={theme === "dark"}
      >
        <Moon className="size-4" aria-hidden="true" />
        <span className="sr-only">Oscuro</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("system")}
        className={`rounded-md px-3 py-1.5 text-muted-foreground transition-colors ${
          theme === "system"
            ? "bg-background text-foreground shadow-sm"
            : "hover:bg-background/50"
        }`}
        aria-pressed={theme === "system"}
      >
        <Monitor className="size-4" aria-hidden="true" />
        <span className="sr-only">Sistema</span>
      </button>
    </div>
  );
}

/**
 * Toggle simple entre claro y oscuro (sin "sistema").
 *
 * Útil si se prefiere un solo botón en el header.
 */
export function ThemeToggleSimple() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
      aria-label={resolvedTheme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      aria-pressed={resolvedTheme === "dark"}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </button>
  );
}