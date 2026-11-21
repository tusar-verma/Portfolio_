"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

/** Preferencia de tema persistida. */
type Theme = "light" | "dark" | "system";

/** Clave de `localStorage`; debe coincidir con la del `ThemeScript`. */
const STORAGE_KEY = "theme";

/**
 * Suscriptores locales del "store" de tema.
 *
 * `storage` (de `useSyncExternalStore`) solo avisa entre pestañas, no en la
 * pestaña que escribe. Este set permite que `setTheme` notifique a los
 * componentes de la misma pestaña.
 */
const listeners = new Set<() => void>();

/** Aplica el tema al `<html>`: solo togglea la clase `dark` (claro es el default). */
function applyTheme(theme: Theme): void {
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

/** Suscribe a cambios del tema (otra pestaña o `setTheme` local). */
function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Lee la preferencia actual del cliente. */
function getSnapshot(): Theme {
  return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
}

/**
 * Snapshot en el servidor: el tema real vive en el cliente, así que se asume
 * "system". `useSyncExternalStore` usa este valor en SSR y en la hidratación,
 * y recién después re-renderiza con el real, sin warning de hidratación.
 */
function getServerSnapshot(): Theme {
  return "system";
}

/** Cambia el tema: persiste, aplica la clase y notifica a los suscriptores. */
function setTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
  listeners.forEach((listener) => listener());
}

/**
 * Textos del selector de tema, ya resueltos al idioma.
 *
 * Se pasan por prop (no se leen acá) porque este es un Client Component y los
 * textos viven en el diccionario del servidor. El header los inyecta.
 */
export interface ThemeToggleLabels {
  /** Etiqueta accesible del grupo. */
  group: string;
  /** Opción de tema claro. */
  light: string;
  /** Opción de tema oscuro. */
  dark: string;
  /** Opción de seguir el sistema. */
  system: string;
}

/** Textos por defecto en español, por si el toggle se usa sin `labels`. */
const DEFAULT_LABELS: ThemeToggleLabels = {
  group: "Tema",
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
};

/** Opciones del selector, en orden de aparición (ícono + clave de texto). */
const OPTIONS = [
  { value: "light", Icon: Sun, key: "light" },
  { value: "dark", Icon: Moon, key: "dark" },
  { value: "system", Icon: Monitor, key: "system" },
] as const;

/**
 * Props de {@link ThemeToggle}.
 */
interface ThemeToggleProps {
  /** Textos del control; por defecto, en español. */
  labels?: ThemeToggleLabels;
}

/**
 * Selector de tema con tres opciones: claro, oscuro y sistema.
 *
 * Client Component autocontenido. Lee la preferencia con `useSyncExternalStore`
 * —el modo idiomático de React para estado externo mutable (localStorage)— que
 * es seguro en hidratación vía `getServerSnapshot`, así que no hace falta el
 * clásico truco de `mounted`. El `ThemeScript` del layout ya aplicó el tema
 * antes del paint (anti-FOUC); este control solo lo cambia y lo refleja.
 *
 * Ver docs/decisions.md #10.
 */
export function ThemeToggle({ labels = DEFAULT_LABELS }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    // En modo "sistema", reaplicar la clase cuando cambia la preferencia del SO.
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  return (
    <div
      className="flex items-center gap-1 rounded-lg bg-muted p-1 text-sm"
      role="group"
      aria-label={labels.group}
    >
      {OPTIONS.map(({ value, Icon, key }) => {
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
            <span className="sr-only">{labels[key]}</span>
          </button>
        );
      })}
    </div>
  );
}
