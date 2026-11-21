"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Calcula el tema resuelto a partir del tema configurado y la preferencia del sistema.
 */
function computeResolvedTheme(theme: Theme, enableSystem: boolean): "light" | "dark" {
  if (theme === "system" && enableSystem) {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  }
  return theme === "dark" ? "dark" : "light";
}

/**
 * Proveedor de tema que persiste la preferencia en localStorage y
 * respeta `prefers-color-scheme` cuando el tema es "system".
 *
 * Se usa en `src/app/[lang]/layout.tsx` para envolver toda la aplicación.
 * Evita el flash de contenido incorrecto (FOUC) leyendo localStorage antes
 * del primer paint en el cliente.
 */
export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
}: {
  children: ReactNode;
  attribute?: "class" | "data-theme";
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}) {
  // Inicializa mounted en true solo en el cliente para evitar FOUC
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme | null) ?? defaultTheme;
    }
    return defaultTheme;
  });

  // El tema resuelto se calcula durante el render
  const resolvedTheme = mounted
    ? computeResolvedTheme(theme, enableSystem)
    : "light";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    if (attribute === "class") {
      root.classList.remove("light", "dark");
      root.classList.add(resolvedTheme);
    } else {
      root.setAttribute("data-theme", resolvedTheme);
    }
    localStorage.setItem("theme", theme);

    if (disableTransitionOnChange) {
      document.documentElement.style.transition = "none";
      requestAnimationFrame(() => {
        document.documentElement.style.transition = "";
      });
    }
  }, [theme, resolvedTheme, mounted, disableTransitionOnChange, attribute]);

  useEffect(() => {
    if (!enableSystem || theme !== "system" || !mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = window.document.documentElement;
      const newResolved = mediaQuery.matches ? "dark" : "light";
      root.classList.remove("light", "dark");
      root.classList.add(newResolved);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem, mounted]);

  if (!mounted) {
    // Renderiza solo el children sin envolver para evitar mismatch de hidratación
    // El tema real se aplica en el useEffect de arriba.
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de tema.
 *
 * Lanza error si se usa fuera de un `ThemeProvider`.
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
}