import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Playfair_Display } from "next/font/google";
import { lang } from "next/root-params";
import "../globals.css";
import { cn } from "@/lib/utils";
import { defaultLocale, isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { profile } from "@/lib/profile";
import { siteUrl } from "@/lib/site";
import { ThemeScript } from "@/components/theme/theme-script";

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

/** Locale de OpenGraph (formato `idioma_TERRITORIO`) por cada locale del sitio. */
const OG_LOCALE: Record<Locale, string> = {
  es: "es_ES",
  en: "en_US",
};

/**
 * Metadata base del sitio, resuelta por idioma.
 *
 * Fija `metadataBase` (para que las rutas relativas de canonical/OG se vuelvan
 * absolutas), el template de `title` (cada página pone su título y se le suma
 * el nombre del sitio), la descripción por idioma y los defaults de OpenGraph y
 * Twitter. El canonical y los `hreflang` se definen por página con
 * `alternatesFor` (ver `src/lib/seo.ts`). Ver docs/decisions.md #14.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: profile.name,
      template: `%s · ${profile.name}`,
    },
    description: dict.siteDescription,
    openGraph: {
      type: "website",
      siteName: profile.name,
      locale: OG_LOCALE[locale],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

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
      // ThemeScript fija la clase de tema en <html> antes de hidratar;
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
        {/* Fija el tema antes del paint; debe ir primero. Ver decisions.md #10. */}
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}
