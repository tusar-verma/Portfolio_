/**
 * Locales soportados por el sitio.
 *
 * El orden no implica prioridad: el locale por defecto se define en
 * `defaultLocale`. Se usa en `generateStaticParams` y en el proxy, así que
 * debe ser una constante serializable y sin dependencias.
 */
export const locales = ["es", "en"] as const;

/** Locale válido del sitio, derivado de `locales`. */
export type Locale = (typeof locales)[number];

/**
 * Locale al que se redirige cuando `Accept-Language` no coincide con ninguno
 * de los soportados.
 */
export const defaultLocale: Locale = "es";

/**
 * Valida si un string es un locale soportado.
 *
 * Es un type guard para poder indexar diccionarios y copias por idioma sin
 * castear. También lo usa el proxy antes de decidir si redirige.
 *
 * @param value Segmento de URL o etiqueta de idioma a validar.
 * @returns `true` si `value` es uno de los locales soportados.
 */
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
