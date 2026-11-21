---
name: add-project
description: Agrega un nuevo proyecto universitario al portfolio a partir de un repo y un informe PDF. Usar cuando se pida cargar, crear o agregar un proyecto.
---

## Pasos
1. Pedir (si no están) el slug, el path/URL del repo y el PDF del informe.
2. Leer el README del repo y el informe. Extraer: problema, enfoque,
   tecnologías, resultados, rol, curso, año.
3. Crear `content/projects/<slug>/meta.json` válido según
   `src/lib/schema.ts`.
4. Crear `content/projects/<slug>/index.mdx` con secciones:
   Problema, Enfoque, Resultados, Qué aprendí.
5. Copiar el PDF a `public/papers/<slug>.pdf` y poner la cover en
   `content/projects/<slug>/cover.png` (pedirla si falta).
6. Correr `npm run build` para validar el esquema.
7. NO modificar componentes ni páginas. Si hace falta, parar y avisar.

## Reglas
- Nunca inventar datos que no estén en las fuentes: dejar TODO.
- Mantener el mismo tono y estructura que los proyectos existentes.