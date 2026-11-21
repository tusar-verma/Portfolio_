import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

/**
 * Resuelve el locale preferido a partir de `Accept-Language`.
 *
 * No usa `@formatjs/intl-localematcher` ni `negotiator` para no sumar
 * dependencias al proxy, que corre antes del render. Tampoco interpreta los
 * pesos `q=`: para dos idiomas alcanza con el orden del header, que en la
 * práctica ya refleja la preferencia. Si el sitio creciera a más locales,
 * convendría parsearlos.
 *
 * @param request Request entrante.
 * @returns El locale soportado de mayor preferencia, o `null` si ninguno.
 */
function detectLocale(request: NextRequest): Locale | null {
  const header = request.headers.get("accept-language");

  if (!header) return null;

  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase();
    if (!tag) continue;

    const base = tag.split("-")[0];
    if (base && isLocale(base)) return base;
  }

  return null;
}

/**
 * Proxy de internacionalización.
 *
 * Si el primer segmento del path ya es un locale, deja pasar la request. Si
 * no, redirige a `/{locale}` conservando path y query string.
 *
 * Corre antes del render (no es layout ni página) y no accede a datos de
 * proyectos: su única responsabilidad es elegir el idioma de la URL.
 *
 * @param request Request entrante.
 * @returns La request sin cambios o una redirección al path con locale.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];

  if (segment && isLocale(segment)) {
    return NextResponse.next();
  }

  const locale = detectLocale(request) ?? defaultLocale;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(url);
}

/**
 * Configuración del matcher del proxy.
 *
 * Excluye `_next` (assets internos) y cualquier ruta con extensión
 * (`/papers/*.pdf`, `favicon.ico`, `robots.txt`) para que los archivos
 * estáticos no terminen redirigidos a `/{locale}/...`.
 */
export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
