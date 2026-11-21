/**
 * URL base del sitio, usada para construir metadata absoluta (canonical,
 * OpenGraph, sitemap).
 *
 * Se configura con la variable de entorno `NEXT_PUBLIC_SITE_URL`; en desarrollo
 * cae a `localhost`. Se normaliza sin barra final para poder concatenar rutas.
 *
 * TODO: fijar la URL de producción cuando se defina el deploy (ver AGENTS.md).
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");
