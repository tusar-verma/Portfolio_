import { readProjectCover } from "@/lib/projects-fs";

/**
 * Sirve la portada de un proyecto en `GET /[lang]/projects/[slug]/cover`.
 *
 * La imagen se lee de `content/projects/<slug>/` a través de
 * `src/lib/projects-fs.ts` (única capa que toca disco), así que agregar un
 * proyecto no requiere copiar archivos a `public/`. El `lang` no altera la
 * imagen: está en la URL solo para que el listado y la ficha puedan usar
 * rutas relativas al idioma activo.
 *
 * Es dinámica: lee del sistema de archivos en cada request. Responde con
 * `Cache-Control` largo porque una portada cambia solo si se reemplaza el
 * archivo y se vuelve a desplegar.
 *
 * @param _request Request entrante; no se usa.
 * @param context Contexto tipado con los params de la ruta.
 * @returns La imagen con su tipo MIME, o 404 si el proyecto no existe.
 */
export async function GET(
  _request: Request,
  context: RouteContext<"/[lang]/projects/[slug]/cover">,
) {
  const { slug } = await context.params;
  const cover = await readProjectCover(slug);

  if (!cover) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(cover.data, {
    headers: {
      "Content-Type": cover.contentType,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
