import { MDXRemote } from "next-mdx-remote/rsc";
import type { ComponentProps } from "react";

/** Estilo compartido por los links del contenido MDX. */
const linkClass =
  "font-medium underline underline-offset-4 decoration-border transition-colors hover:decoration-foreground";

/**
 * Mapa de elementos MDX a componentes con los estilos editoriales del sitio.
 *
 * Se define a nivel de módulo para no recrear las funciones en cada render.
 * No se usa `@tailwindcss/typography` para no sumar otra dependencia ni un
 * tema paralelo: los proyectos solo usan títulos, párrafos, listas, citas y
 * código, y acá quedan alineados con el resto del sitio.
 */
const components = {
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="mt-12 mb-4 font-heading text-2xl leading-snug tracking-tight"
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3
      className="mt-8 mb-3 font-heading text-xl leading-snug tracking-tight"
      {...props}
    />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="mb-4 leading-relaxed" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="mb-6 list-disc space-y-2 pl-5" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="mb-6 list-decimal space-y-2 pl-5" {...props} />
  ),
  li: (props: ComponentProps<"li">) => (
    <li className="leading-relaxed" {...props} />
  ),
  a: ({ href = "", ...props }: ComponentProps<"a">) => {
    // Los links externos se abren en otra pestaña; los internos no.
    const isExternal = href.startsWith("http");

    return (
      <a
        href={href}
        className={linkClass}
        {...(isExternal
          ? { target: "_blank", rel: "noreferrer" }
          : undefined)}
        {...props}
      />
    );
  },
  strong: (props: ComponentProps<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="my-6 border-l-2 border-border pl-4 text-muted-foreground italic"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => (
    <code className="bg-muted px-1 py-0.5 font-mono text-[0.9em]" {...props} />
  ),
  pre: (props: ComponentProps<"pre">) => (
    // `[&_code]` neutraliza el fondo del `code` inline dentro de un bloque.
    <pre
      className="mb-6 overflow-x-auto border border-border bg-muted p-4 text-sm [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    />
  ),
  hr: (props: ComponentProps<"hr">) => (
    <hr className="my-10 border-border" {...props} />
  ),
};

/**
 * Props de {@link MdxContent}.
 */
interface MdxContentProps {
  /** MDX crudo ya resuelto al idioma de la página (ver `getProject`). */
  source: string;
}

/**
 * Renderiza la descripción larga de un proyecto.
 *
 * Se usa solo en `/[lang]/projects/[slug]`. El contenido llega como string
 * desde `src/lib/projects.ts`; este componente no lee archivos ni conoce el
 * idioma, solo aplica los estilos del sitio.
 */
export function MdxContent({ source }: MdxContentProps) {
  return <MDXRemote source={source} components={components} />;
}
