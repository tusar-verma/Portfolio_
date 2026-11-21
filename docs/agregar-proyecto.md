# Cómo agregar un proyecto

Agregar un proyecto es **copiar una carpeta**. No se tocan componentes ni
páginas: la validación y el listado se arman solos a partir del contenido.

## 1. Crear la carpeta

Creá `content/projects/<slug>/`, donde `<slug>` es el identificador que va en
la URL (`/es/projects/<slug>`). El slug sale del **nombre de la carpeta**, así
que usá minúsculas, números y guiones:

- Válido: `compilador-mini-c`, `analisis-ventas`, `sistema-turnos-2024`
- Inválido: `Compilador`, `análisis ventas`, `turnos_app`

## 2. Archivos de la carpeta

| Archivo | Obligatorio | Qué es |
|---|---|---|
| `meta.json` | Sí | Metadatos del proyecto (ver abajo). |
| `index.mdx` | Sí | Descripción larga **en español**. |
| `cover.png` | Sí | Portada (también `.jpg`, `.jpeg`, `.webp` o `.avif`). |
| `index.en.mdx` | No | Descripción larga en inglés (traducción). |

Además, el informe PDF va **fuera** de la carpeta, en `public/papers/`:

- `public/papers/<slug>.pdf` — informe en español (obligatorio).
- `public/papers/<slug>-en.pdf` — informe en inglés (opcional).

Si falta un archivo obligatorio, **el build falla** con un mensaje que nombra
el proyecto y el archivo que falta.

## 3. `meta.json`

El esquema es estricto: un campo de más o mal escrito **falla el build**
(lo valida `src/lib/schema.ts`). Campos:

| Campo | Tipo | Notas |
|---|---|---|
| `title` | `{ es, en? }` | Título. El inglés es opcional (ver abajo). |
| `summary` | `{ es, en? }` | Descripción corta (20–280 caracteres). |
| `year` | número | Año de cursada. Ordena el listado (desc). |
| `course` | texto | Materia o curso. |
| `institution` | texto | Institución. |
| `stack` | texto[] | Tecnologías. Al menos una. |
| `tags` | texto[] | En minúsculas-con-guiones. Al menos uno. |
| `repoUrl` | URL | Repositorio del código (`https://…`). |
| `paperUrl` | ruta | `/papers/<slug>.pdf`. |
| `paperUrlEn` | ruta | Opcional. `/papers/<slug>-en.pdf`. |
| `demoUrl` | URL | Opcional. |
| `cover` | nombre | Nombre del archivo de portada (ej. `cover.png`). |
| `featured` | bool | Si aparece en los destacados de la home. |
| `status` | enum | `"completed"` o `"in-progress"`. |

## 4. Con o sin traducción al inglés

El contenido es **español por defecto**; el inglés es **opcional por proyecto**.

### Sin traducción (solo español)

Lo mínimo. En `meta.json`, `title` y `summary` solo con `es`:

```json
{
  "title": { "es": "Análisis de datos de ventas" },
  "summary": { "es": "Exploración de un dataset de ventas con pandas…" }
}
```

- No crees `index.en.mdx`.
- En `/en`, el proyecto se muestra con el texto en español y un aviso
  ("Solo en español" en el listado, un recuadro en la ficha).

> Ejemplo real en el repo: `content/projects/analisis-ventas/`.

### Con traducción (español + inglés)

1. Agregá `en` a `title` y `summary` en `meta.json`:

   ```json
   {
     "title": { "es": "Compilador para un subconjunto de C", "en": "Compiler for a subset of C" },
     "summary": { "es": "Análisis léxico…", "en": "Lexical analysis…" }
   }
   ```

2. Creá `index.en.mdx` con la descripción larga en inglés.
3. (Opcional) Agregá `public/papers/<slug>-en.pdf` y `paperUrlEn` en `meta.json`.

> **Regla de consistencia:** si existe `index.en.mdx`, `title.en` y `summary.en`
> son obligatorios (si no, el build falla, para no mezclar idiomas en una misma
> tarjeta).
>
> Ejemplo real: `content/projects/compilador-mini-c/`.

## 5. Verificar

```bash
npm run build
```

Si todo está bien, el build prerenderiza la ficha del proyecto en ambos idiomas
y el listado lo ordena por año. Si algo falta o está mal, el error nombra el
archivo y el campo.

Más detalle del porqué de cada decisión: `docs/decisions.md` (#6, #8, #9, #13).
