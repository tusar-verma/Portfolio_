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
4. Crear `content/projects/<slug>/index.mdx` en español con secciones:
   Problema, Enfoque, Resultados, Qué aprendí.
5. Copiar el PDF a `public/papers/<slug>.pdf` y poner la cover en
   `content/projects/<slug>/cover.png` (pedirla si falta).
6. Correr `npm run build` para validar el esquema.
7. NO modificar componentes ni páginas. Si hace falta, parar y avisar.

## Inglés (opcional)
- No traducir automáticamente. El contenido se publica en español.
- Si el usuario entrega una traducción revisada, agregar `title.en` y
  `summary.en` en `meta.json` e `index.en.mdx` en la misma carpeta.
- Si existe `index.en.mdx`, el build exige `title.en` y `summary.en`.
- Repo y PDF no se traducen.

## Reglas
- Nunca inventar datos que no estén en las fuentes: dejar TODO.
- Mantener el mismo tono y estructura que los proyectos existentes.