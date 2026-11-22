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
  /** Descripción del sitio para metadata/SEO (no es lorem: es texto real). */
  siteDescription:
    "Portfolio de proyectos académicos: el código y el informe de cada trabajo de la facultad.",
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
    /** Texto accesible del link al perfil de LinkedIn. */
    linkedin: "LinkedIn",
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
    /** Descripción personal, un párrafo por entrada. */
    aboutBody: [
      "Soy Tusar, técnico en computación y estudiante avanzado de la Licenciatura en Ciencias de la Computación (FCEyN, UBA). Estoy rindiendo las últimas materias y pronto arrancaré la tesis de licenciatura.",
      "Tengo un fuerte interés en Machine Learning. Cursé varias materias del área y desarrollé varios proyectos. Te invito a explorarlos, vas a encontrar un breve resumen de cada uno y, si te interesa, podés profundizar con el paper y el código.",
      "También tengo experiencia en desarrollo fullstack; durante un tiempo desarrollé aplicaciones en la ANSV (Agencia Nacional de Seguridad Vial). Tecnologías que manejo: TypeScript, NextJS, NestJS, React, Python, SQL (bases relacionales), NoSQL (MongoDB, Redis), Java, C, C++, Smalltalk, Haskell y Prolog.",
    ],
    /** Etiqueta de la sección de contacto del hero. */
    contactLabel: "Encontrame en",
    /** Título de la sección de proyectos de la home. */
    projectsTitle: "Proyectos desarrollados en mi trayecto académico",
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
