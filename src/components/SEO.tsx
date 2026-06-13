import { Helmet } from "react-helmet-async";

export interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  canonical?: string;
  type?: "website" | "article";
  keywords?: string;
  author?: string;
  publishedTime?: string;
  /** Optional JSON-LD structured data. Object or array of objects. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE_NAME = "Magadh Explora";
const DEFAULT_DESC =
  "Bihar's #1 tourism company. Buddhist & Jain pilgrimage tours to Bodh Gaya, Nalanda, Rajgir, Vaishali. Expert multilingual guides.";

function absoluteUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

export function SEO({
  title,
  description = DEFAULT_DESC,
  image,
  canonical,
  type = "website",
  keywords,
  author,
  publishedTime,
  jsonLd,
}: SEOProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl =
    canonical ??
    (typeof window !== "undefined" ? window.location.href.split("?")[0] : undefined);
  const ogImage = absoluteUrl(image);
  const ldArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {author && type === "article" && <meta property="article:author" content={author} />}

      {/* Twitter */}
      <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  );
}

export default SEO;
