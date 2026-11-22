import "server-only";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "./dictionaries/es";

/**
 * Carga perezosa de cada diccionario.
 *
 * Se importan con `import()` dinámico para que cada idioma viaje en su propio
 * chunk y no se incluyan ambos en el mismo bundle. `server-only` garantiza que
 * los diccionarios nunca se filtren a un Client Component (ahí se pasan solo
 * los textos que hagan falta, por prop).
 */
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  es: () => import("./dictionaries/es").then((module) => module.es),
  en: () => import("./dictionaries/en").then((module) => module.en),
};

/**
 * Devuelve el diccionario de UI del idioma pedido.
 *
 * Lo usan los Server Components del chrome (header, footer) y la home. Es la
 * única vía para leer textos de interfaz, igual que `getProjects` lo es para
 * el contenido. Ver docs/decisions.md #12.
 *
 * @param lang Idioma soportado.
 * @returns El diccionario correspondiente.
 */
export async function getDictionary(lang: Locale): Promise<Dictionary> {
  return dictionaries[lang]();
}
