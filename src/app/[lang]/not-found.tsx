import Link from "next/link";

/**
 * 404 del segmento `/[lang]`.
 *
 * Se muestra cuando una página llama `notFound()`. No lee el root param a
 * propósito: este archivo también puede renderizarse en contextos donde el
 * locale no está disponible (por ejemplo, el 404 global de Next), y leer
 * `lang()` ahí rompería el render. Por eso el texto es bilingüe y cada link
 * apunta a un locale concreto.
 *
 * Es estático.
 */
export default function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        404
      </p>
      <h1 className="font-heading text-3xl leading-tight tracking-tight sm:text-4xl">
        Página no encontrada · Page not found
      </h1>
      <p className="max-w-xl text-muted-foreground">
        La dirección no existe o cambió de lugar. · The address does not exist or
        has moved.
      </p>
      <div className="flex gap-4 text-sm font-medium">
        <Link href="/es" className="underline underline-offset-4">
          Ir al inicio (ES)
        </Link>
        <Link href="/en" className="underline underline-offset-4">
          Go to home (EN)
        </Link>
      </div>
    </section>
  );
}
