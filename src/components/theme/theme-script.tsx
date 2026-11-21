/**
 * Fija la clase de tema en `<html>` antes del primer paint (anti-FOUC).
 *
 * El `<script>` corre durante la carga inicial del HTML, antes de que React
 * hidrate, así que no hay flash. Para evitar el warning de React 19
 * ("Encountered a script tag while rendering React component"), se usa el
 * patrón oficial de Next.js (guía "preventing flash before hydration"): el
 * script lleva `type="text/javascript"` en el servidor (se ejecuta) y
 * `type="text/plain"` en el cliente (React no lo trata como script a ejecutar).
 * `suppressHydrationWarning` absorbe la diferencia de `type` entre ambos.
 *
 * Lee la preferencia de `localStorage` (`theme`: light | dark | system) y, si
 * falta o es `system`, usa `prefers-color-scheme`. Solo togglea la clase
 * `dark`: el tema claro es el `:root` por defecto de `globals.css`.
 *
 * Reemplaza a `next-themes`. Ver docs/decisions.md #10.
 */
const SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||((t===null||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export function ThemeScript() {
  return (
    <script
      // En el servidor ejecuta; en el cliente React lo ve como texto inerte y
      // no emite el warning de <script>. Ver el docstring del componente.
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: SCRIPT }}
    />
  );
}
