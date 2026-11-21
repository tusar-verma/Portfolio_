import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/**
 * Robots del sitio en `/robots.txt`.
 *
 * Permite todo e indica dónde está el sitemap. Se genera en el build.
 *
 * @returns Las reglas de crawling y la URL del sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
