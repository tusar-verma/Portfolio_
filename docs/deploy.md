# Deploy en Vercel (Hobby)

Este sitio usa funciones de servidor de Next 16 (middleware/proxy de idioma,
route handler de portadas, Cache Components / PPR), así que necesita un host con
runtime de Node. **Vercel Hobby (gratis)** lo soporta sin cambios. Un host
estático como GitHub Pages **no** sirve (ver `docs/decisions.md` y el chat del
proyecto).

## Pasos

1. Subí el repo a GitHub (ya está en `main`).
2. Entrá a https://vercel.com, **Add New… → Project**, e importá el repo.
3. Vercel detecta Next.js solo. Dejá los defaults:
   - Framework: **Next.js**
   - Build command: `next build` (automático)
   - Output: automático
4. **Deploy**. Listo: los PDFs de `public/papers/` se sirven como estáticos.

No hace falta `vercel.json`: Vercel autodetecta todo.

## URL base (canonical / OpenGraph / sitemap)

La URL base la resuelve `src/lib/site.ts` en este orden:

1. `NEXT_PUBLIC_SITE_URL` si está seteada.
2. `VERCEL_PROJECT_PRODUCTION_URL` — la setea **Vercel sola** (el dominio de
   producción del proyecto). Por eso **en el deploy por defecto no hay que
   configurar nada**: el canonical, el OG y el sitemap salen con el dominio
   `*.vercel.app`.
3. `http://localhost:3000` en desarrollo.

### Dominio propio

Si conectás un dominio propio (ej. `tusar.dev`):

1. En Vercel: **Project → Settings → Domains**, agregá el dominio.
2. En **Settings → Environment Variables**, agregá:
   - `NEXT_PUBLIC_SITE_URL = https://tudominio.com` (con protocolo, sin barra
     final), scope **Production**.
3. Redeploy para que el sitemap/canonical tomen el dominio nuevo.

> `VERCEL_PROJECT_PRODUCTION_URL` ya elige el dominio custom más corto si existe,
> así que seteando el dominio en Vercel suele alcanzar; `NEXT_PUBLIC_SITE_URL`
> queda como override explícito y a prueba de dudas.

## Verificación post-deploy

- Abrí `/` → redirige a `/es` o `/en` según el navegador (middleware).
- Abrí `/sitemap.xml` y `/robots.txt` → deben mostrar el dominio real, no
  `localhost`.
- Abrí una ficha de proyecto → la portada (`/es/projects/<slug>/cover`) y el
  PDF (`/papers/<slug>.pdf`) cargan.
- Probá el cambio de idioma y el toggle de tema.
