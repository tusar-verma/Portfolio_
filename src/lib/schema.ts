import { z } from "zod";
import type { Locale } from "@/i18n/config";

/**
 * Texto que puede estar en varios idiomas.
 *
 * El español es obligatorio y el inglés opcional: el contenido de los
 * proyectos se escribe primero en español y se traduce solo cuando la
 * versión está revisada. Si falta el inglés, la capa de contenido devuelve
 * el español y la UI avisa que no hay traducción.
 */
export interface LocalizedText {
  /** Versión en español (obligatoria). */
  es: string;
  /** Versión en inglés (opcional). */
  en?: string;
}

/**
 * Construye el esquema de un texto localizado con límites de longitud.
 *
 * @param minLongitud Mínimo de caracteres por idioma.
 * @param maxLongitud Máximo de caracteres por idioma.
 * @param campo Nombre del campo, usado en los mensajes de error.
 */
function localizedText(
  minLongitud: number,
  maxLongitud: number,
  campo: string,
) {
  const idioma = z
    .string()
    .trim()
    .min(
      minLongitud,
      `${campo}: se esperaban al menos ${minLongitud} caracteres`,
    )
    .max(
      maxLongitud,
      `${campo}: se esperaban como máximo ${maxLongitud} caracteres`,
    );

  return z.strictObject({ es: idioma, en: idioma.optional() });
}

/**
 * Formato permitido para slugs y tags.
 *
 * Se usa tanto para el nombre de la carpeta del proyecto como para los tags
 * que viajan en la URL del filtro (`?tag=...`), así que no admite mayúsculas,
 * espacios ni acentos.
 */
export const slugSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Usá minúsculas, números y guiones (ej. machine-learning)",
  );

/** Estado de avance de un proyecto. */
export const projectStatusSchema = z.enum(["completed", "in-progress"]);

/** Estado de avance de un proyecto, derivado de su esquema. */
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

/** URL absoluta con protocolo http o https. */
const httpUrlSchema = z
  .url()
  .refine(
    (value) => /^https?:\/\//.test(value),
    "La URL debe empezar con http:// o https://",
  );

/**
 * Archivo de portada dentro de la carpeta del proyecto.
 *
 * Solo se guarda el nombre del archivo: la URL pública la deriva
 * `src/lib/projects.ts` según el idioma.
 */
const coverFileSchema = z
  .string()
  .regex(
    /^[\w.-]+\.(png|jpe?g|webp|avif)$/i,
    "cover debe ser una imagen (png, jpg, webp o avif) dentro de la carpeta del proyecto",
  );

/** Ruta pública del informe PDF, servida desde `public/papers/`. */
const paperUrlSchema = z
  .string()
  .regex(
    /^\/papers\/[a-z0-9]+(?:-[a-z0-9]+)*\.pdf$/,
    "paperUrl debe tener la forma /papers/<slug>.pdf",
  );

/**
 * Esquema de `content/projects/<slug>/meta.json`.
 *
 * Es estricto: un campo desconocido o mal escrito falla el build, para que un
 * typo no pase desapercibido. El slug no se incluye porque se deriva del
 * nombre de la carpeta y así no puede desincronizarse.
 */
export const projectMetaSchema = z.strictObject({
  title: localizedText(3, 120, "title"),
  summary: localizedText(20, 280, "summary"),
  year: z
    .number()
    .int("year debe ser un número entero")
    .min(2000, "year debe ser posterior a 2000")
    .max(2100, "year debe ser anterior a 2100"),
  course: z.string().trim().min(1, "course no puede estar vacío"),
  institution: z.string().trim().min(1, "institution no puede estar vacío"),
  stack: z
    .array(z.string().trim().min(1))
    .min(1, "stack necesita al menos una tecnología"),
  tags: z.array(slugSchema).min(1, "tags necesita al menos un tag"),
  repoUrl: httpUrlSchema,
  paperUrl: paperUrlSchema,
  paperUrlEn: paperUrlSchema.optional(),
  demoUrl: httpUrlSchema.optional(),
  cover: coverFileSchema.default("cover.png"),
  featured: z.boolean().default(false),
  status: projectStatusSchema,
});

/** Metadatos de un proyecto tal como se validan desde `meta.json`. */
export type ProjectMeta = z.infer<typeof projectMetaSchema>;

/**
 * Proyecto listo para mostrar: metadatos ya resueltos al idioma pedido.
 *
 * Es el contrato que consumen las páginas y componentes. No expone el objeto
 * `{ es, en }` para que la UI no tenga que saber que el sitio es bilingüe.
 */
export interface ProjectSummary {
  /** Slug derivado del nombre de la carpeta del proyecto. */
  slug: string;
  /** Título en el idioma solicitado, con fallback al español. */
  title: string;
  /** Resumen corto en el idioma solicitado, con fallback al español. */
  summary: string;
  /**
   * `true` si título y resumen existen en el idioma solicitado.
   *
   * La UI lo usa para avisar cuando muestra contenido en español dentro del
   * sitio en inglés. No cambia los datos: `title` y `summary` ya vienen
   * resueltos con fallback.
   */
  isTranslated: boolean;
  /** Año de cursada. */
  year: number;
  /** Materia o curso al que pertenece el proyecto. */
  course: string;
  /** Institución donde se presentó. */
  institution: string;
  /** Tecnologías usadas. */
  stack: string[];
  /** Tags normalizados para el filtro. */
  tags: string[];
  /** Repositorio con el código. */
  repoUrl: string;
  /** Ruta pública del informe PDF, con fallback al español. */
  paperUrl: string;
  /** Demo opcional. */
  demoUrl?: string;
  /** URL de la portada, resuelta por idioma. */
  coverUrl: string;
  /** Si aparece en los destacados de la home. */
  featured: boolean;
  /** Estado de avance. */
  status: ProjectStatus;
}

/**
 * Proyecto con su descripción larga en MDX.
 *
 * Solo lo devuelve `getProject()`, porque leer todos los MDX para un listado
 * sería trabajo innecesario.
 */
export interface ProjectDetail extends ProjectSummary {
  /** Contenido MDX crudo, ya resuelto con fallback al español. */
  content: string;
  /**
   * Idioma en el que está realmente el MDX.
   *
   * Puede no coincidir con el locale de la URL cuando el proyecto todavía no
   * tiene traducción; la ficha lo usa para mostrar el aviso.
   */
  contentLanguage: Locale;
}
