import "server-only";

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { ZodError } from "zod";
import { projectMetaSchema, slugSchema, type ProjectMeta } from "@/lib/schema";

/** Carpeta raíz del contenido, relativa al working directory del build. */
const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

/** Carpeta pública, usada para validar que el PDF del informe exista. */
const PUBLIC_DIR = path.join(process.cwd(), "public");

/**
 * Proyecto leído desde disco, sin resolver el idioma.
 *
 * Es un tipo interno del adaptador: los consumidores reciben `ProjectSummary`
 * o `ProjectDetail` desde `src/lib/projects.ts`.
 */
export interface RawProject {
  /** Slug validado, tomado del nombre de la carpeta. */
  slug: string;
  /** Metadatos validados con `projectMetaSchema`. */
  meta: ProjectMeta;
}

/** Proyecto con el MDX de todos los idiomas ya leído. */
export interface RawProjectSource extends RawProject {
  /**
   * Contenido MDX por locale. `es` falta si el proyecto no tiene descripción
   * larga (es opcional); `en` falta si no hay traducción.
   */
  content: { es?: string; en?: string };
}

/**
 * Convierte una ruta absoluta en una ruta relativa al repo con separadores
 * `/`, para que los errores de build se lean igual en Windows y en Linux.
 *
 * @param filePath Ruta absoluta a mostrar.
 */
function relativePath(filePath: string): string {
  return path.relative(process.cwd(), filePath).replace(/\\/g, "/");
}

/**
 * Indica si un archivo existe.
 *
 * Se usa `stat` en lugar de `access` para no depender de permisos: si el
 * archivo no se puede leer, el error aparece al abrirlo, con su ruta.
 *
 * @param filePath Ruta absoluta a comprobar.
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Formatea los issues de Zod como una lista legible por campo.
 *
 * @param error Error devuelto por `safeParse`.
 * @returns Una línea por issue, con el path del campo.
 */
function formatIssues(error: ZodError): string[] {
  return error.issues.map((issue) => {
    const campo = issue.path.length > 0 ? issue.path.join(".") : "(raíz)";
    return `${campo}: ${issue.message}`;
  });
}

/**
 * Lee y valida `meta.json` de un proyecto.
 *
 * @param slug Nombre de la carpeta del proyecto.
 * @throws Si el archivo no se puede leer, el JSON es inválido o no cumple el
 * esquema. El mensaje incluye la ruta y los campos con error.
 */
async function readMeta(slug: string): Promise<ProjectMeta> {
  const metaPath = path.join(CONTENT_DIR, slug, "meta.json");

  const raw = await readFile(metaPath, "utf8").catch(() => {
    throw new Error(`${relativePath(metaPath)}: no se pudo leer el archivo`);
  });

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `${relativePath(metaPath)}: JSON inválido (${(error as Error).message})`,
    );
  }

  const result = projectMetaSchema.safeParse(json);
  if (!result.success) {
    throw new Error(
      `${relativePath(metaPath)}:\n  - ${formatIssues(result.error).join("\n  - ")}`,
    );
  }

  return result.data;
}

/**
 * Verifica que existan los archivos obligatorios y los opcionales declarados.
 *
 * Obligatorios: portada y el PDF en español. La descripción larga (`index.mdx`)
 * es opcional: un proyecto puede quedarse con el resumen y los metadatos. El
 * inglés también es opcional; si existe `index.en.mdx`, `meta.json` debe traer
 * `title.en` y `summary.en` para que el listado en inglés no mezcle idiomas.
 * Falla en el build en vez de dejar un link roto.
 *
 * @param slug Slug del proyecto.
 * @param meta Metadatos ya validados, de donde salen `cover`, `paperUrl` y
 * `paperUrlEn`.
 * @throws Si falta un archivo obligatorio, el PDF inglés declarado o la
 * traducción de los textos que acompañan a `index.en.mdx`.
 */
async function assertProjectAssets(
  slug: string,
  meta: ProjectMeta,
): Promise<void> {
  const required = [
    path.join(CONTENT_DIR, slug, meta.cover),
    path.join(PUBLIC_DIR, meta.paperUrl.replace(/^\//, "")),
    ...(meta.paperUrlEn
      ? [path.join(PUBLIC_DIR, meta.paperUrlEn.replace(/^\//, ""))]
      : []),
  ];

  const missing: string[] = [];
  for (const filePath of required) {
    if (!(await fileExists(filePath))) missing.push(relativePath(filePath));
  }

  if (missing.length > 0) {
    throw new Error(
      `Faltan archivos del proyecto "${slug}":\n  - ${missing.join("\n  - ")}`,
    );
  }

  const englishMdx = path.join(CONTENT_DIR, slug, "index.en.mdx");
  if ((await fileExists(englishMdx)) && (!meta.title.en || !meta.summary.en)) {
    throw new Error(
      `content/projects/${slug}: existe index.en.mdx pero falta title.en o summary.en en meta.json`,
    );
  }
}

/**
 * Lee y valida los metadatos de todos los proyectos.
 *
 * Acumula los errores de todas las carpetas para que un build inválido
 * muestre todo lo que falta de una sola vez. No lee los MDX: alcanza con
 * verificar que existan.
 *
 * @returns Los proyectos válidos, sin ordenar.
 * @throws Si algún proyecto tiene metadatos inválidos o le faltan archivos.
 */
export async function readProjectMetas(): Promise<RawProject[]> {
  const entries = await readdir(CONTENT_DIR, {
    withFileTypes: true,
  }).catch((error: NodeJS.ErrnoException) => {
    // Sin carpeta de contenido el sitio sigue funcionando (listado vacío).
    if (error.code === "ENOENT") return [];
    throw error;
  });

  const slugs = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();

  const projects: RawProject[] = [];
  const errors: string[] = [];

  for (const slug of slugs) {
    const validSlug = slugSchema.safeParse(slug);

    if (!validSlug.success) {
      errors.push(
        `content/projects/${slug}: nombre de carpeta inválido. ${
          validSlug.error.issues[0]?.message ?? ""
        }`,
      );
      continue;
    }

    try {
      const meta = await readMeta(slug);
      await assertProjectAssets(slug, meta);
      projects.push({ slug, meta });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (errors.length > 0) {
    throw new Error(`Contenido de proyectos inválido:\n\n${errors.join("\n\n")}`);
  }

  return projects;
}

/** Tipos MIME admitidos por `coverFileSchema`, indexados por extensión. */
const COVER_CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
};

/**
 * Lee la portada de un proyecto desde su carpeta de contenido.
 *
 * La imagen no vive en `public/` para que agregar un proyecto siga siendo
 * copiar una carpeta. El route handler de `/[lang]/projects/[slug]/cover` es
 * el único consumidor.
 *
 * @param slug Slug pedido por la URL.
 * @returns Los bytes de la portada y su tipo MIME, o `null` si el proyecto
 * no existe o el slug es inválido.
 * @throws Si los metadatos del proyecto son inválidos o la portada falta.
 */
export async function readProjectCover(
  slug: string,
): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  if (!slugSchema.safeParse(slug).success) return null;

  const metaPath = path.join(CONTENT_DIR, slug, "meta.json");
  if (!(await fileExists(metaPath))) return null;

  const meta = await readMeta(slug);
  await assertProjectAssets(slug, meta);

  const coverPath = path.join(CONTENT_DIR, slug, meta.cover);
  const extension = path.extname(meta.cover).slice(1).toLowerCase();
  const file = await readFile(coverPath);

  return {
    // Se copia a un `ArrayBuffer` propio: `Response` no acepta un
    // `Uint8Array` genérico y el buffer de `readFile` puede venir con offset.
    data: file.buffer.slice(
      file.byteOffset,
      file.byteOffset + file.byteLength,
    ) as ArrayBuffer,
    contentType: COVER_CONTENT_TYPES[extension] ?? "application/octet-stream",
  };
}

/**
 * Lee un proyecto completo, con el MDX en español y el inglés si existe.
 *
 * @param slug Slug pedido por la URL.
 * @returns El proyecto, o `null` si el slug no es válido o no existe.
 * @throws Si los metadatos o los archivos del proyecto son inválidos.
 */
export async function readProjectSource(
  slug: string,
): Promise<RawProjectSource | null> {
  if (!slugSchema.safeParse(slug).success) return null;

  const metaPath = path.join(CONTENT_DIR, slug, "meta.json");
  if (!(await fileExists(metaPath))) return null;

  const meta = await readMeta(slug);
  await assertProjectAssets(slug, meta);

  const spanishPath = path.join(CONTENT_DIR, slug, "index.mdx");
  const englishPath = path.join(CONTENT_DIR, slug, "index.en.mdx");
  const [es, en] = await Promise.all([
    // La descripción larga es opcional (ver assertProjectAssets).
    fileExists(spanishPath).then((exists) =>
      exists ? readFile(spanishPath, "utf8") : undefined,
    ),
    // La traducción es opcional: `assertProjectAssets` ya validó que, si
    // existe, los textos de `meta.json` también estén en inglés.
    fileExists(englishPath).then((exists) =>
      exists ? readFile(englishPath, "utf8") : undefined,
    ),
  ]);

  return { slug, meta, content: { es, en } };
}
