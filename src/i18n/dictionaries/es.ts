/**
 * Diccionario de la UI en español.
 *
 * Es la fuente de verdad de la estructura: {@link Dictionary} se deriva de este
 * objeto con `typeof`, así que `en.ts` debe tener exactamente las mismas claves
 * (TypeScript lo exige al tiparlo como `Dictionary`). Solo contiene textos de
 * interfaz (navegación, chrome, home); el contenido de los proyectos vive en
 * `content/` y los datos personales en `src/lib/profile.ts`. Ver
 * docs/decisions.md #12.
 */
export const es = {
  /** Texto del enlace para saltar al contenido principal (accesibilidad). */
  skipLink: "Saltar al contenido",
  nav: {
    home: "Inicio",
    projects: "Proyectos",
  },
  localeSwitcher: {
    /** Etiqueta accesible del grupo de botones de idioma. */
    label: "Idioma",
    /** Nombre de cada idioma, en su propio idioma. */
    names: {
      es: "Español",
      en: "English",
    },
  },
  theme: {
    /** Etiqueta accesible del grupo del selector de tema. */
    label: "Tema",
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
  },
  footer: {
    /** Texto accesible del link al perfil de GitHub. */
    github: "GitHub",
    /** Texto accesible del link de correo. */
    email: "Correo",
  },
  /** Textos de las tarjetas/listado de proyectos (reusados en home y listado). */
  projects: {
    code: "Código",
    paper: "Informe",
    spanishOnly: "Solo en español",
  },
  home: {
    /** Eyebrow de la sección "sobre mí". */
    aboutEyebrow: "Sobre mí",
    /** Descripción personal. PLACEHOLDER (lorem ipsum): reemplazar. */
    aboutBody:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    /** Título de la sección de proyectos de la home. */
    projectsTitle: "Proyectos desarrollados en mi trayecto académico",
    /** Link a la página completa de proyectos. */
    allProjects: "Ver todos los proyectos",
  },
};

/**
 * Forma del diccionario de UI, derivada del español.
 *
 * Se usa para tipar `en.ts` y garantizar que ambos idiomas tengan las mismas
 * claves. No se exporta `as const` a propósito: así los textos son `string` y
 * no literales, y el inglés puede tener valores distintos.
 */
export type Dictionary = typeof es;
