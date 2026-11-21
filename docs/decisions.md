# Registro de decisiones

Formato de cada entrada:
- **#N — Título** [categoría: arquitectura | UI | contenido | rendimiento | tooling]
- **Contexto:** qué problema había
- **Decisión:** qué se eligió
- **Alternativas descartadas:** y por qué
- **Consecuencias:** qué implica
- **Código relacionado:** archivos o funciones afectadas
- **Estado:** vigente | reemplazada por #N

---

## #1 — Contenido en archivos con capa de acceso única
**Contexto:** Quiero agregar proyectos fácil y, más adelante, tener un
admin panel sin recompilar.
**Decisión:** Metadatos en `meta.json` + descripción en MDX, validados con
Zod. Todo acceso pasa por `src/lib/projects.ts`.
**Consecuencias:** Migrar a DB/CMS = reimplementar `projects.ts` (y usar
revalidación en vez de build estático puro). Los componentes no cambian.
**Estado:** vigente

## #2 — shadcn/ui + Tailwind para UI
**Contexto:** Necesito componentes accesibles y personalizables rápido.
**Decisión:** shadcn/ui sobre Tailwind.
**Consecuencias:** Los componentes viven en el repo y se editan libremente.
**Estado:** vigente