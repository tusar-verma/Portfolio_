import type { Dictionary } from "./es";

/**
 * Diccionario de la UI en inglés.
 *
 * Tipado como {@link Dictionary}: si falta o sobra una clave respecto del
 * español, el build falla. Ver docs/decisions.md #12.
 */
export const en: Dictionary = {
  skipLink: "Skip to content",
  siteDescription:
    "Academic project portfolio: the code and the paper behind each piece of coursework.",
  nav: {
    home: "Home",
    projects: "Projects",
  },
  localeSwitcher: {
    label: "Language",
    names: {
      es: "Español",
      en: "English",
    },
  },
  theme: {
    label: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  footer: {
    github: "GitHub",
    email: "Email",
  },
  projects: {
    code: "Code",
    paper: "Paper",
    spanishOnly: "Spanish only",
  },
  home: {
    aboutEyebrow: "About me",
    // PLACEHOLDER (lorem ipsum): reemplazar.
    aboutBody:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    projectsTitle: "Projects built during my studies",
    allProjects: "See all projects",
  },
};
