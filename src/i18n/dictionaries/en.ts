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
    linkedin: "LinkedIn",
    email: "Email",
  },
  projects: {
    code: "Code",
    paper: "Paper",
    spanishOnly: "Spanish only",
  },
  home: {
    aboutEyebrow: "About me",
    // Traducción del bio; ajustable por el usuario.
    aboutBody: [
      "I'm Tusar, a computer technician and an advanced undergraduate student of Computer Science (FCEyN, UBA). I'm taking my last courses and will soon start my undergraduate thesis.",
      "I'm strongly interested in Machine Learning: I took several courses in the field and built a number of projects. I invite you to explore them: you'll find a short summary of each and, if you're interested, you can dig deeper with the report and the code.",
      "I also have experience in fullstack development; for a while I built applications at ANSV (Argentina's National Road Safety Agency). Technologies I work with: TypeScript, NextJS, NestJS, React, Python, SQL (relational databases), NoSQL (MongoDB, Redis), Java, C, C++, Smalltalk, Haskell and Prolog.",
    ],
    contactLabel: "Find me on",
    projectsTitle: "Projects built during my studies",
  },
};
