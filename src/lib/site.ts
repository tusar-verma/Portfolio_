/**
 * URL base del sitio, usada para construir metadata absoluta (canonical,
 * OpenGraph, sitemap).
 *
 * Orden de prioridad:
 * 1. `NEXT_PUBLIC_SITE_URL` — explícita. Usala para un dominio propio o para
 *    sobrescribir en cualquier entorno.
 * 2. `VERCEL_PROJECT_PRODUCTION_URL` — el dominio de producción **estable** que
 *    Vercel setea solo (hostname sin protocolo). Gracias a esto el deploy en
 *    Vercel funciona sin configurar nada. Ver `docs/deploy.md`.
 * 3. `http://localhost:3000` — desarrollo.
 *
 * Se normaliza sin barra final para poder concatenar rutas. Solo se usa en
 * contexto de servidor/build (metadata, sitemap, robots), por eso puede leer
 * `VERCEL_PROJECT_PRODUCTION_URL`, que no lleva el prefijo `NEXT_PUBLIC_`.
 *
 * @returns La URL base sin barra final.
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    // Vercel da solo el hostname (ej. "mi-sitio.vercel.app"), sin protocolo.
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

/** URL base del sitio, sin barra final. */
export const siteUrl = resolveSiteUrl().replace(/\/+$/, "");
