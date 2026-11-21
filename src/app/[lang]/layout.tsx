import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Playfair_Display } from "next/font/google";
import { lang } from "next/root-params";
import "../globals.css";
import { cn } from "@/lib/utils";
import { locales } from "@/i18n/config";
import { ThemeProviderWrapper } from "@/components/theme/theme-provider-wrapper";

const playfairDisplayHeading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadata base del sitio.
 *
 * Cada página puede sobrescribir `title` y `description`; el template
 * mantiene el nombre del sitio al final. La metadata por locale (canonical,
 * hreflang, OpenGraph) se completa en la Fase 8.
 */
export const metadata: Metadata = {
  title: {
    default: "Portfolio universitario",
    template: "%s · Portfolio universitario",
  },
  description:
    "Proyectos de la universidad, con el código y el informe de cada trabajo.",
};

/**
 * Prerenderiza el layout raíz para cada locale soportado.
 *
 * Con Cache Components es obligatorio que cada root param tenga al menos un
 * valor: sin esto el build falla. Además habilita `lang()` de
 * `next/root-params` durante el prerender.
 *
 * @returns Un objeto `{ lang }` por cada locale soportado.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

/**
 * Layout raíz del sitio para `/[lang]`.
 *
 * Renderiza `<html>` y `<body>`, carga las fuentes y los estilos globales, y
 * fija el atributo `lang` con el root param. No lee datos de proyectos: la
 * capa de contenido se usa recién en las páginas.
 *
 * Es estático: `generateStaticParams` genera una variante por locale.
 */
export default async function RootLayout({
  children,
}: LayoutProps<"/[lang]">) {
  return (
    <html
      lang={await lang()}
      // next-themes fija la clase de tema en <html> antes de hidratar;
      // suppressHydrationWarning evita el warning por ese cambio. Solo aplica
      // un nivel de profundidad. Ver docs/decisions.md #10.
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        notoSans.variable,
        playfairDisplayHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
      </body>
    </html>
  );
}
