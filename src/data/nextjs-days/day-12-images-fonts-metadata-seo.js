export default {
  id: 'day-12-images-fonts-metadata-seo',
  title: 'Images, Fonts, Metadata API and SEO (next/image, next/font, generateMetadata, sitemap)',
  module: 'Module 2: Data & Rendering',
  day: 12,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Next.js ships built-in tools for the three things that most affect how fast and how findable a site is: the <Image> component for optimized, lazy, layout-stable images; next/font for self-hosted fonts with zero layout shift; and the Metadata API (metadata, generateMetadata, sitemap.js, robots.js, opengraph-image) for SEO and social sharing.',
  objectives: [
    'Use next/image with width/height, fill, sizes, priority and remote patterns',
    'Load Google and local fonts with next/font and apply them through className or CSS variables',
    'Define static metadata and dynamic generateMetadata for title, description, Open Graph and canonical URLs',
    'Create sitemap.js, robots.js and a dynamic Open Graph image',
    'Explain Core Web Vitals (LCP, CLS, INP) and how these features improve them',
  ],
  theory: [
    {
      heading: 'Why images, fonts and metadata matter: Core Web Vitals',
      content:
        'Google ranks pages partly by **Core Web Vitals**:\n- **LCP (Largest Contentful Paint)**: how fast the biggest element (often a hero image) appears. Target under 2.5 s.\n- **CLS (Cumulative Layout Shift)**: how much the page jumps while loading (images without size, late fonts). Target under 0.1.\n- **INP (Interaction to Next Paint)**: how quickly the page reacts to clicks. Target under 200 ms.\n\nImages are usually the heaviest bytes on a page, and web fonts are a classic cause of text "jumping". Metadata (title, description, Open Graph) decides how your page looks in Google results and when shared on WhatsApp/LinkedIn.\n\nAnalogy: a shop. Images are the window display (must load fast and not fall over), fonts are the signboard (should not flicker), metadata is the shop\'s listing in the city directory (how people find you).',
    },
    {
      heading: 'next/image: the optimized <Image> component',
      content:
        '`import Image from \'next/image\'` replaces `<img>` and automatically:\n- **Resizes** and serves modern formats (**WebP/AVIF**) for each device width\n- **Lazy loads** images below the fold (loads when near the viewport)\n- **Prevents layout shift** by reserving space using `width` and `height` (or the static import\'s dimensions)\n- Caches optimized versions on the server/CDN\n\nRequired props: `src`, `alt`, and either `width` + `height`, or `fill` (image fills its positioned parent).\n\nImportant props:\n- `priority`: preload the LCP/hero image, disables lazy loading. Use on the main above-the-fold image only.\n- `sizes`: tells the browser how wide the image will be at each breakpoint, e.g. `"(max-width: 768px) 100vw, 33vw"`. Essential with `fill` or responsive layouts, otherwise the browser may download a too-large file.\n- `placeholder="blur"`: shows a blurred preview (automatic for static imports; for remote images give `blurDataURL`).\n- `quality` (default 75).\n\n**Remote images** must be allowed in `next.config.js` via `images.remotePatterns`, which protects your optimizer from being abused.',
      syntax:
        "// next.config.js\n/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  images: {\n    remotePatterns: [\n      { protocol: 'https', hostname: 'images.unsplash.com' },\n      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/my-account/**' },\n    ],\n  },\n};\nmodule.exports = nextConfig;",
      tip: 'Common mistake: using fill without giving the parent position: relative (or absolute/fixed) and a height. The image then has nothing to fill and becomes invisible or covers the page.',
    },
    {
      heading: 'next/font: fonts without layout shift',
      content:
        '`next/font` downloads Google Fonts **at build time** and serves them from your own domain - no request to Google at runtime (faster and better for privacy/GDPR). It also generates a fallback font with adjusted metrics (`size-adjust`) so text does not jump when the real font arrives (CLS ≈ 0).\n\n- `next/font/google`: `import { Inter, Roboto_Mono } from \'next/font/google\'`\n- `next/font/local`: your own .woff2 files\n\nCall the font function at **module scope** (not inside a component) and apply it using `.className` or a CSS variable via `variable: \'--font-inter\'` (great with Tailwind).\n\nOptions: `subsets: [\'latin\']` (required for Google fonts to reduce size), `weight` (needed for non-variable fonts), `display: \'swap\'` (default).',
      syntax:
        "// app/layout.js\nimport { Inter, Playfair_Display } from 'next/font/google';\nimport './globals.css';\n\nconst inter = Inter({ subsets: ['latin'], variable: '--font-inter' });\nconst playfair = Playfair_Display({ subsets: ['latin'], weight: ['700'], variable: '--font-display' });\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang=\"en\" className={inter.variable + ' ' + playfair.variable}>\n      <body className={inter.className}>{children}</body>\n    </html>\n  );\n}\n\n/* globals.css */\nh1, h2 { font-family: var(--font-display), serif; }",
    },
    {
      heading: 'The Metadata API: metadata and generateMetadata',
      content:
        'Instead of writing `<head>` tags manually, export metadata from a `layout.js` or `page.js` (Server Components only):\n\n1. **Static**: `export const metadata = { title, description, ... }`\n2. **Dynamic**: `export async function generateMetadata({ params })` that fetches data (e.g. product name) and returns the object. In Next.js 15 `params` is a **Promise**, so `await params` first. Fetch requests are deduplicated with the page\'s own fetch.\n\nMetadata **merges** from the root layout down to the page. A **title template** in the root layout (`title: { default: \'Shop\', template: \'%s | Shop\' }`) turns a page title "Shoes" into "Shoes | Shop".\n\n`metadataBase` sets the base URL so relative Open Graph image and canonical URLs become absolute.\n\nUseful fields: `title`, `description`, `keywords`, `openGraph` (title, description, images, type), `twitter` (card), `alternates.canonical`, `robots` (index/follow), `icons`. The `viewport` and `themeColor` go in a separate `export const viewport` / `generateViewport`.',
      syntax:
        "// app/layout.js\nexport const metadata = {\n  metadataBase: new URL('https://shop.example.com'),\n  title: { default: 'Shop', template: '%s | Shop' },\n  description: 'Affordable shoes and bags',\n  openGraph: { siteName: 'Shop', type: 'website' },\n};\n\n// app/products/[slug]/page.js\nexport async function generateMetadata({ params }) {\n  const { slug } = await params;\n  const p = await getProduct(slug);\n  return {\n    title: p.name,                                   // -> \"Red Sneakers | Shop\"\n    description: p.summary,\n    alternates: { canonical: '/products/' + slug },\n    openGraph: { images: [{ url: p.image, width: 1200, height: 630 }] },\n  };\n}",
    },
    {
      heading: 'File-based SEO: sitemap, robots, icons and Open Graph images',
      content:
        'Special files in `app/` generate SEO assets automatically:\n- `app/sitemap.js` - export a function returning `[{ url, lastModified, changeFrequency, priority }]` → served at `/sitemap.xml`\n- `app/robots.js` - returns `{ rules, sitemap }` → served at `/robots.txt`\n- `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png` - favicons, linked automatically\n- `app/opengraph-image.png` or `opengraph-image.js` - the image shown when the link is shared. The `.js` version uses `ImageResponse` from `next/og` to draw the image from JSX at request/build time (e.g. the blog post title on a gradient).\n\nAlso add **structured data (JSON-LD)** for products/articles by rendering a `<script type="application/ld+json">` with `JSON.stringify(data)` in the page.\n\nSEO checklist: one `<h1>` per page, unique title + description per page, descriptive `alt` text, canonical URLs, fast LCP, sitemap submitted in Google Search Console, and server-rendered content (which Next.js gives you by default).',
      syntax:
        "// app/sitemap.js\nexport default async function sitemap() {\n  const products = await getAllProducts();\n  return [\n    { url: 'https://shop.example.com', lastModified: new Date(), priority: 1 },\n    ...products.map((p) => ({\n      url: 'https://shop.example.com/products/' + p.slug,\n      lastModified: p.updatedAt,\n      changeFrequency: 'weekly',\n      priority: 0.8,\n    })),\n  ];\n}\n\n// app/robots.js\nexport default function robots() {\n  return {\n    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },\n    sitemap: 'https://shop.example.com/sitemap.xml',\n  };\n}",
      points: [
        'metadata/generateMetadata only work in Server Components (layout.js / page.js)',
        'sitemap.js and robots.js are cached (static) by default unless they use dynamic data',
        'opengraph-image size convention: 1200 x 630',
      ],
    },
  ],
  examples: [
    {
      title: 'Hero image with priority and a responsive product grid with sizes',
      scenario: 'A shop home page shows a large hero banner (the LCP element) and a grid of product thumbnails that should lazy load.',
      steps: [
        'Allow the remote host in next.config.js images.remotePatterns',
        'Render the hero with <Image fill priority sizes="100vw"> inside a relative container with a fixed height',
        'Render product cards with width/height and a sizes attribute for 1/2/3 columns',
        'Run next build && next start and open DevTools > Network > Img: note WebP/AVIF and different widths',
        'In the playground SIMULATION, scroll the grid and watch images "load" only when they enter the viewport (lazy loading with IntersectionObserver)',
      ],
      code:
        "// app/page.js\nimport Image from 'next/image';\n\nconst products = [\n  { id: 1, name: 'Sneakers', src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' },\n  { id: 2, name: 'Backpack', src: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62' },\n];\n\nexport default function Home() {\n  return (\n    <main>\n      <div style={{ position: 'relative', height: 420 }}>\n        <Image\n          src=\"https://images.unsplash.com/photo-1441986300917-64674bd600d8\"\n          alt=\"Inside our store with shelves of shoes\"\n          fill\n          priority                 // hero = LCP: preload, no lazy loading\n          sizes=\"100vw\"\n          style={{ objectFit: 'cover' }}\n        />\n      </div>\n\n      <section className=\"grid\">\n        {products.map((p) => (\n          <article key={p.id}>\n            <Image\n              src={p.src}\n              alt={p.name}\n              width={400}\n              height={300}\n              sizes=\"(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw\"\n            />\n            <h2>{p.name}</h2>\n          </article>\n        ))}\n      </section>\n    </main>\n  );\n}",
      playground: {
        jsx: "// SIMULATION of next/image lazy loading + reserved space (no CLS) using plain React.\n// Each box reserves its aspect ratio BEFORE the image loads, just like width/height on <Image>.\nfunction LazyImage({ src, alt, width, height }) {\n  const ref = React.useRef(null);\n  const [visible, setVisible] = React.useState(false);\n  const [loaded, setLoaded] = React.useState(false);\n  React.useEffect(() => {\n    const io = new IntersectionObserver(([entry]) => {\n      if (entry.isIntersecting) { setVisible(true); io.disconnect(); }\n    }, { rootMargin: '50px' });\n    io.observe(ref.current);\n    return () => io.disconnect();\n  }, []);\n  return (\n    <div ref={ref} style={{ aspectRatio: width + ' / ' + height, background: '#e5e7eb', position: 'relative', borderRadius: 8, overflow: 'hidden' }}>\n      {visible && <img src={src} alt={alt} onLoad={() => setLoaded(true)}\n        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: loaded ? 1 : 0, transition: 'opacity .4s' }} />}\n      <span style={{ position: 'absolute', left: 6, top: 6, fontSize: 12, background: '#fff', padding: '0 4px' }}>\n        {loaded ? 'loaded' : visible ? 'loading...' : 'waiting (lazy)'}\n      </span>\n    </div>\n  );\n}\n\nfunction App() {\n  const ids = Array.from({ length: 12 }, (_, i) => i + 10);\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <p>Scroll inside the box: images load only when they come into view.</p>\n      <div style={{ height: 260, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, padding: 4, border: '1px solid #ccc' }}>\n        {ids.map((id) => (\n          <LazyImage key={id} src={'https://picsum.photos/id/' + id + '/400/300'} alt={'Photo ' + id} width={400} height={300} />\n        ))}\n      </div>\n    </div>\n  );\n}",
      },
      result: 'The first 4 boxes show "loaded"; boxes further down say "waiting (lazy)" until you scroll to them. Boxes keep their size before and after loading, so nothing jumps.',
      explanation:
        'next/image does the same work for you: it reserves space from width/height (no CLS), adds loading="lazy" for non-priority images, builds a srcset of resized WebP/AVIF files, and uses sizes to pick the smallest file that looks sharp. The hero uses priority because it is the LCP element.',
    },
    {
      title: 'Fonts with next/font and CSS variables',
      scenario: 'A blog uses Inter for body text and a serif display font for headings, with no layout shift and no runtime request to Google.',
      steps: [
        'Import Inter and Merriweather from next/font/google in app/layout.js',
        'Configure subsets, weights and a CSS variable for each',
        'Add the variable classes to <html> and inter.className to <body>',
        'Use var(--font-serif) for headings in globals.css (or fontFamily in tailwind.config)',
        'In the playground SIMULATION toggle the "font loaded" state with and without metric-matched fallback to see what CLS looks like',
      ],
      code:
        "// app/layout.js\nimport { Inter, Merriweather } from 'next/font/google';\nimport './globals.css';\n\nconst inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });\nconst merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-serif' });\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang=\"en\" className={inter.variable + ' ' + merriweather.variable}>\n      <body>{children}</body>\n    </html>\n  );\n}\n\n/* app/globals.css */\nbody { font-family: var(--font-sans), system-ui, sans-serif; }\nh1, h2, h3 { font-family: var(--font-serif), Georgia, serif; }\n\n// Local font\n// import localFont from 'next/font/local';\n// const brand = localFont({ src: './fonts/Brand.woff2', variable: '--font-brand' });",
      playground: {
        jsx: "// SIMULATION: why next/font's adjusted fallback prevents layout shift (CLS).\n// Without adjustment, the fallback font has different width/height, so text re-wraps when the web font arrives.\nfunction Paragraph({ font, sizeAdjust }) {\n  return (\n    <p style={{ fontFamily: font, fontSize: 16 * sizeAdjust, width: 260, border: '1px dashed #aaa', padding: 6 }}>\n      Next.js downloads fonts at build time and creates a fallback font with matching metrics, so your text keeps the same size when the real font loads.\n    </p>\n  );\n}\n\nfunction App() {\n  const [loaded, setLoaded] = React.useState(false);\n  const [adjusted, setAdjusted] = React.useState(true);\n  // 'Georgia' plays the web font; 'Courier New' plays an unadjusted fallback\n  const font = loaded ? 'Georgia, serif' : adjusted ? 'Georgia, serif' : 'Courier New, monospace';\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <label><input type=\"checkbox\" checked={adjusted} onChange={(e) => setAdjusted(e.target.checked)} /> metric-adjusted fallback (next/font)</label><br />\n      <button onClick={() => setLoaded((l) => !l)}>{loaded ? 'Reset to fallback' : 'Simulate font finished loading'}</button>\n      <Paragraph font={font} sizeAdjust={1} />\n      <p style={{ fontSize: 13 }}>Watch the dashed box height: with the checkbox off it changes when the font \"loads\" = layout shift.</p>\n    </div>\n  );\n}",
      },
      result: 'With the checkbox OFF, clicking the button changes the paragraph from monospace to serif and the box height changes (layout shift). With it ON, the box does not change.',
      explanation:
        'next/font self-hosts the font files and generates a fallback @font-face with size-adjust, ascent and descent overrides so the fallback occupies the same space. The simulation uses the same font for the "adjusted" case to show the zero-shift goal.',
    },
    {
      title: 'Dynamic metadata for a product page + JSON-LD',
      scenario: 'Each product page needs its own title, description, canonical URL, Open Graph image and Product structured data.',
      steps: [
        'Add a title template and metadataBase in the root layout',
        'Export async generateMetadata({ params }) in app/products/[slug]/page.js',
        'await params, fetch the product (the same fetch the page uses is deduplicated)',
        'Return title, description, alternates.canonical and openGraph.images',
        'Render a JSON-LD <script> in the page body',
        'In the SIMULATION, pick a product and see the generated <head> tags and a social preview card',
      ],
      code:
        "// app/products/[slug]/page.js\nimport { notFound } from 'next/navigation';\n\nasync function getProduct(slug) {\n  const res = await fetch('https://api.example.com/products/' + slug, { next: { revalidate: 3600 } });\n  if (!res.ok) return null;\n  return res.json();\n}\n\nexport async function generateMetadata({ params }) {\n  const { slug } = await params;\n  const product = await getProduct(slug);\n  if (!product) return { title: 'Product not found' };\n  return {\n    title: product.name,\n    description: product.summary,\n    alternates: { canonical: '/products/' + slug },\n    openGraph: {\n      title: product.name,\n      description: product.summary,\n      images: [{ url: product.image, width: 1200, height: 630, alt: product.name }],\n    },\n    twitter: { card: 'summary_large_image' },\n  };\n}\n\nexport default async function ProductPage({ params }) {\n  const { slug } = await params;\n  const product = await getProduct(slug);\n  if (!product) notFound();\n\n  const jsonLd = {\n    '@context': 'https://schema.org',\n    '@type': 'Product',\n    name: product.name,\n    image: product.image,\n    offers: { '@type': 'Offer', price: product.price, priceCurrency: 'INR' },\n  };\n\n  return (\n    <article>\n      <script type=\"application/ld+json\" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />\n      <h1>{product.name}</h1>\n      <p>{product.summary}</p>\n    </article>\n  );\n}",
      playground: {
        jsx: "// SIMULATION of generateMetadata: compute head tags from data + a root title template.\nconst rootMetadata = { base: 'https://shop.example.com', template: '%s | Shop', siteName: 'Shop' };\nconst products = {\n  'red-sneakers': { name: 'Red Sneakers', summary: 'Lightweight running shoes for daily training.', image: 'https://picsum.photos/id/21/600/315', price: 2499 },\n  'travel-bag': { name: 'Travel Bag', summary: 'Water-resistant 40L cabin bag with laptop sleeve.', image: 'https://picsum.photos/id/96/600/315', price: 3299 },\n};\n\nfunction generateMetadata(slug) {\n  const p = products[slug];\n  return {\n    title: rootMetadata.template.replace('%s', p.name),\n    description: p.summary,\n    canonical: rootMetadata.base + '/products/' + slug,\n    ogImage: p.image,\n  };\n}\n\nfunction App() {\n  const [slug, setSlug] = React.useState('red-sneakers');\n  const m = generateMetadata(slug);\n  const head = [\n    '<title>' + m.title + '</title>',\n    '<meta name=\"description\" content=\"' + m.description + '\">',\n    '<link rel=\"canonical\" href=\"' + m.canonical + '\">',\n    '<meta property=\"og:title\" content=\"' + products[slug].name + '\">',\n    '<meta property=\"og:image\" content=\"' + m.ogImage + '\">',\n  ].join('\\n');\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <select value={slug} onChange={(e) => setSlug(e.target.value)}>\n        {Object.keys(products).map((s) => <option key={s} value={s}>{s}</option>)}\n      </select>\n      <pre style={{ background: '#111', color: '#9f9', padding: 8, fontSize: 12, whiteSpace: 'pre-wrap' }}>{head}</pre>\n      <div style={{ border: '1px solid #ccc', borderRadius: 8, width: 300, overflow: 'hidden' }}>\n        <img src={m.ogImage} alt=\"\" style={{ width: '100%', display: 'block' }} />\n        <div style={{ padding: 8 }}>\n          <small>shop.example.com</small>\n          <div><b>{products[slug].name}</b></div>\n          <small>{m.description}</small>\n        </div>\n      </div>\n    </div>\n  );\n}",
      },
      result: 'Choosing "travel-bag" updates the <title> to "Travel Bag | Shop", the description, canonical URL and the social preview card image.',
      explanation:
        'The title template from the root layout wraps the page title. generateMetadata runs on the server before streaming the page, so crawlers and social bots see complete tags in the initial HTML.',
    },
    {
      title: 'Dynamic Open Graph image with next/og',
      scenario: 'Every blog post should get a share image showing its title on a branded background, generated automatically.',
      steps: [
        'Create app/blog/[slug]/opengraph-image.js',
        'Export size, contentType and alt',
        'Export a default async function that returns new ImageResponse(<div>...</div>, size)',
        'Open /blog/my-post/opengraph-image in the browser to see the PNG',
        'Check the page <head>: og:image now points to that route automatically',
      ],
      code:
        "// app/blog/[slug]/opengraph-image.js\nimport { ImageResponse } from 'next/og';\nimport { getPost } from '@/lib/posts';\n\nexport const size = { width: 1200, height: 630 };\nexport const contentType = 'image/png';\nexport const alt = 'Blog post cover';\n\nexport default async function OgImage({ params }) {\n  const { slug } = await params;\n  const post = await getPost(slug);\n  return new ImageResponse(\n    (\n      <div\n        style={{\n          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',\n          justifyContent: 'center', padding: 80,\n          background: 'linear-gradient(135deg, #0f172a, #1d4ed8)', color: 'white',\n        }}\n      >\n        <div style={{ fontSize: 28, opacity: 0.8 }}>DevBlog</div>\n        <div style={{ fontSize: 64, fontWeight: 700 }}>{post.title}</div>\n      </div>\n    ),\n    size\n  );\n}",
      playground: {
        jsx: "// SIMULATION: preview what the generated 1200x630 OG image would look like (scaled down).\nfunction OgPreview({ title }) {\n  return (\n    <div style={{ width: 400, height: 210, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 26,\n      boxSizing: 'border-box', background: 'linear-gradient(135deg, #0f172a, #1d4ed8)', color: 'white', borderRadius: 8 }}>\n      <div style={{ fontSize: 10, opacity: 0.8 }}>DevBlog</div>\n      <div style={{ fontSize: 22, fontWeight: 700 }}>{title || 'Untitled'}</div>\n    </div>\n  );\n}\n\nfunction App() {\n  const [title, setTitle] = React.useState('Server Actions in 10 minutes');\n  return (\n    <div style={{ fontFamily: 'sans-serif' }}>\n      <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: 380, marginBottom: 8 }} />\n      <OgPreview title={title} />\n      <p style={{ fontSize: 13 }}>Real file: app/blog/[slug]/opengraph-image.js returns new ImageResponse(jsx, {'{'} width: 1200, height: 630 {'}'})</p>\n    </div>\n  );\n}",
      },
      result: 'Typing a new title instantly updates the gradient card, which represents the PNG Next.js would generate for that post.',
      explanation:
        'ImageResponse renders a subset of JSX + CSS (flexbox only) into a PNG using Satori. Placing opengraph-image.js in a route segment automatically adds the og:image meta tag for that route.',
    },
  ],
  interview: [
    { q: 'What are the benefits of next/image over a plain <img>?', a: 'Automatic resizing and modern formats (WebP/AVIF), responsive srcset, lazy loading by default, space reserved via width/height to avoid CLS, optional blur placeholders, and caching of optimized images. It also requires alt and protects the optimizer with remotePatterns.', level: 'Easy' },
    { q: 'When do you use the priority prop on <Image>?', a: 'On the image that is the Largest Contentful Paint element above the fold (hero banner, main product photo). It preloads the image and disables lazy loading. Using it everywhere defeats its purpose and slows the page.', level: 'Medium' },
    { q: 'What is the sizes prop and why is it important with fill?', a: 'sizes tells the browser how wide the image will be rendered at different viewport widths, e.g. "(max-width: 768px) 100vw, 50vw". The browser uses it to choose the right file from srcset. Without sizes, a fill image assumes 100vw and may download a much larger file than needed.', level: 'Medium' },
    { q: 'Why must remote image hosts be configured?', a: 'The image optimizer fetches and resizes images on your server. If any URL were allowed, attackers could use your server to process arbitrary images (cost and abuse). images.remotePatterns whitelists protocol, hostname and path.', level: 'Medium' },
    { q: 'How does next/font avoid layout shift and improve privacy?', a: 'It downloads font files at build time and serves them from your own domain (no runtime request to Google), preloads them, and generates a fallback font with size-adjust and ascent/descent overrides so text occupies the same space before and after the web font loads.', level: 'Medium' },
    { q: 'Difference between export const metadata and generateMetadata?', a: 'metadata is a static object known at build time. generateMetadata is an async function that receives params/searchParams and can fetch data to build titles and images per page (e.g. product name). Both only work in Server Component layout.js/page.js files.', level: 'Easy' },
    { q: 'How does a title template work?', a: 'In a layout: title: { default: "Shop", template: "%s | Shop" }. Child pages that set title: "Shoes" render "Shoes | Shop". default is used when the child sets no title. A child can use title.absolute to ignore the template.', level: 'Easy' },
    { q: 'What is metadataBase used for?', a: 'It sets the base URL to resolve relative URLs in metadata such as openGraph.images and alternates.canonical into absolute URLs, which social networks and crawlers require.', level: 'Medium' },
    { q: 'How do you create a sitemap and robots.txt in the App Router?', a: 'Add app/sitemap.js exporting a function that returns an array of { url, lastModified, changeFrequency, priority } and app/robots.js returning { rules, sitemap }. Next.js serves them at /sitemap.xml and /robots.txt.', level: 'Easy' },
    { q: 'What are Core Web Vitals?', a: 'Google user-experience metrics: LCP (loading - largest element painted, < 2.5s), CLS (visual stability - layout shift, < 0.1) and INP (responsiveness - interaction to next paint, < 200ms). They affect search ranking and are improved by optimized images, fonts and less client JS.', level: 'Medium' },
    { q: 'How can you add structured data (JSON-LD) in Next.js?', a: 'Render <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} /> in the page or layout Server Component. It helps Google show rich results like price and rating.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create an avatar component using next/image that shows a round 64x64 user photo from a remote host, with correct next.config.js.',
      hint: 'remotePatterns + width/height + borderRadius.',
      solution:
        "// next.config.js\nmodule.exports = {\n  images: { remotePatterns: [{ protocol: 'https', hostname: 'avatars.githubusercontent.com' }] },\n};\n\n// components/Avatar.js\nimport Image from 'next/image';\n\nexport default function Avatar({ src, name }) {\n  return (\n    <Image\n      src={src}\n      alt={name + ' profile photo'}\n      width={64}\n      height={64}\n      style={{ borderRadius: '50%', objectFit: 'cover' }}\n    />\n  );\n}",
    },
    {
      task: 'Build a full-width responsive banner using fill, with a blur placeholder from a static import.',
      hint: 'Static imports provide width, height and blurDataURL automatically.',
      solution:
        "// app/page.js\nimport Image from 'next/image';\nimport banner from '@/public/banner.jpg';   // static import\n\nexport default function Home() {\n  return (\n    <div style={{ position: 'relative', width: '100%', height: '50vh' }}>\n      <Image\n        src={banner}\n        alt=\"Mountains at sunrise\"\n        fill\n        priority\n        placeholder=\"blur\"\n        sizes=\"100vw\"\n        style={{ objectFit: 'cover' }}\n      />\n    </div>\n  );\n}",
    },
    {
      task: 'Configure two fonts (Poppins for headings, Roboto for body) with next/font and wire them into Tailwind.',
      hint: 'variable option + fontFamily in tailwind config (or @theme in Tailwind v4).',
      solution:
        "// app/layout.js\nimport { Poppins, Roboto } from 'next/font/google';\nconst poppins = Poppins({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-poppins' });\nconst roboto = Roboto({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-roboto' });\n\nexport default function RootLayout({ children }) {\n  return (\n    <html lang=\"en\" className={poppins.variable + ' ' + roboto.variable}>\n      <body className=\"font-body\">{children}</body>\n    </html>\n  );\n}\n\n/* app/globals.css (Tailwind v4) */\n@import 'tailwindcss';\n@theme {\n  --font-heading: var(--font-poppins);\n  --font-body: var(--font-roboto);\n}\n/* usage: <h1 className=\"font-heading text-4xl\"> */",
    },
    {
      task: 'Add generateMetadata to a blog post page that sets title, description, canonical and an Open Graph article type with publishedTime.',
      hint: 'await params; openGraph: { type: "article", publishedTime }.',
      solution:
        "// app/blog/[slug]/page.js\nimport { getPost } from '@/lib/posts';\n\nexport async function generateMetadata({ params }) {\n  const { slug } = await params;\n  const post = await getPost(slug);\n  return {\n    title: post.title,\n    description: post.excerpt,\n    alternates: { canonical: '/blog/' + slug },\n    openGraph: {\n      type: 'article',\n      title: post.title,\n      description: post.excerpt,\n      publishedTime: post.publishedAt,\n      authors: [post.author],\n    },\n  };\n}",
    },
    {
      task: 'Create app/sitemap.js that lists the home page and every blog post, and app/robots.js that blocks /admin.',
      hint: 'Both are default-exported functions.',
      solution:
        "// app/sitemap.js\nimport { getAllPosts } from '@/lib/posts';\nconst BASE = 'https://devblog.example.com';\n\nexport default async function sitemap() {\n  const posts = await getAllPosts();\n  return [\n    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },\n    ...posts.map((p) => ({ url: BASE + '/blog/' + p.slug, lastModified: p.updatedAt, priority: 0.7 })),\n  ];\n}\n\n// app/robots.js\nexport default function robots() {\n  return {\n    rules: [{ userAgent: '*', allow: '/', disallow: '/admin' }],\n    sitemap: 'https://devblog.example.com/sitemap.xml',\n  };\n}",
    },
  ],
  quiz: [
    { question: 'Which prop should be added to the hero image that is the LCP element?', options: ['lazy', 'priority', 'unoptimized', 'eager={false}'], answer: 1, explanation: 'priority preloads the image and disables lazy loading.' },
    { question: 'When using fill on <Image>, the parent element must have…', options: ['display: none', 'a z-index', 'position relative/absolute/fixed and a size', 'a background image'], answer: 2, explanation: 'The filled image is absolutely positioned inside its parent.' },
    { question: 'Where does next/font serve Google Fonts from at runtime?', options: ['Your own domain (self-hosted)', 'fonts.googleapis.com', 'A CDN chosen by the browser', 'They are inlined as base64 in HTML'], answer: 0, explanation: 'Fonts are downloaded at build time and self-hosted.' },
    { question: 'In Next.js 15, inside generateMetadata({ params }), params is…', options: ['A plain object', 'A URLSearchParams', 'Undefined', 'A Promise you must await'], answer: 3, explanation: 'Dynamic APIs like params became async in Next.js 15.' },
    { question: 'Which file generates /robots.txt in the App Router?', options: ['public/robots.json', 'app/robots.js', 'pages/robots.js', 'next.config.js'], answer: 1, explanation: 'app/robots.js (or a static app/robots.txt) creates /robots.txt.' },
  ],
};
