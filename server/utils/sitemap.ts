import { isLocalhostUrl, normalizeAbsoluteUrl } from '../../app/utils/schema'

/**
 * Hard production origin. The sitemap is crawler-facing and must never leak a
 * dev/staging/www origin even if `NUXT_PUBLIC_SITE_URL` is misconfigured
 * (e.g. still pointing at localhost in this environment's `.env`).
 */
const PRODUCTION_ORIGIN = 'https://consulting-pros.com'
const PRODUCTION_HOST = 'consulting-pros.com'

export interface SitemapUrlEntry {
  loc: string
  lastmod?: string
}

interface StrapiSeoComponent {
  noindex?: boolean | null
}

interface StrapiSlugRecord {
  slug?: string | null
  updatedAt?: string | null
  publishedAt?: string | null
  seo?: StrapiSeoComponent | null
}

interface StrapiCollectionResponse {
  data?: StrapiSlugRecord[] | null
  meta?: { pagination?: { pageCount?: number } | null } | null
}

interface StrapiGlobalResponse {
  data?: { defaultSeo?: StrapiSeoComponent | null } | null
}

/**
 * One entry per dynamic content type. Adding a future content type (e.g.
 * articles) only requires appending here, as long as it exposes the same
 * slug / updatedAt / publishedAt / seo.noindex shape.
 */
interface SitemapContentSource {
  collection: string
  routePrefix: string
}

const DYNAMIC_CONTENT_SOURCES: SitemapContentSource[] = [
  { collection: 'services', routePrefix: 'services' },
  { collection: 'legal-pages', routePrefix: 'legal' }
]

const STATIC_PAGES: Array<{ path: string }> = [
  { path: '/' },
  { path: '/about' },
  { path: '/services' },
  { path: '/contact' }
]

const PAGE_SIZE = 200
const MAX_PAGES = 5

const CACHE_KEY = 'sitemap:xml'
const SUCCESS_TTL_MS = 10 * 60 * 1000
const FAILURE_TTL_MS = 60 * 1000

interface SitemapCacheEntry {
  xml: string
  expiresAt: number
}

export const resolveSiteOrigin = (): string => {
  const config = useRuntimeConfig()
  const configured = normalizeAbsoluteUrl(config.public.siteUrl)

  if (!configured || isLocalhostUrl(configured)) {
    return PRODUCTION_ORIGIN
  }

  try {
    const host = new URL(configured).hostname.replace(/^www\./i, '')
    return host === PRODUCTION_HOST ? `https://${PRODUCTION_HOST}` : PRODUCTION_ORIGIN
  }
  catch {
    return PRODUCTION_ORIGIN
  }
}

const buildLoc = (origin: string, path: string): string => {
  if (path === '/' || path === '') {
    return `${origin}/`
  }

  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${origin}${normalized.replace(/\/+$/, '')}`
}

const toIsoDate = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

const isValidSlug = (slug?: string | null): slug is string =>
  typeof slug === 'string' && slug.trim().replace(/^\/+|\/+$/g, '').length > 0

const logSitemapError = (source: string, error: unknown) => {
  const status = (error as { statusCode?: number, response?: { status?: number } })?.statusCode
    ?? (error as { response?: { status?: number } })?.response?.status
    ?? 'unknown'
  console.error(`[sitemap] failed to load "${source}" from Strapi (status: ${status})`)
}

const fetchSlugCollection = async (strapiUrl: string, collection: string): Promise<StrapiSlugRecord[]> => {
  const records: StrapiSlugRecord[] = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    const endpoint = `${strapiUrl}/api/${collection}?fields[0]=slug&fields[1]=updatedAt&fields[2]=publishedAt&populate[seo][fields][0]=noindex&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}`
    const response = await $fetch<StrapiCollectionResponse>(endpoint)
    const pageData = Array.isArray(response?.data) ? response.data : []
    records.push(...pageData)

    const pageCount = response?.meta?.pagination?.pageCount ?? 1
    if (page >= pageCount || pageData.length < PAGE_SIZE) {
      break
    }
  }

  return records
}

const fetchGlobalNoindexFallback = async (strapiUrl: string): Promise<boolean> => {
  const endpoint = `${strapiUrl}/api/global?fields[0]=id&populate[defaultSeo][fields][0]=noindex`
  const response = await $fetch<StrapiGlobalResponse>(endpoint)
  const noindex = response?.data?.defaultSeo?.noindex
  return typeof noindex === 'boolean' ? noindex : false
}

const toIndexableEntries = (
  records: StrapiSlugRecord[],
  origin: string,
  routePrefix: string,
  globalNoindexFallback: boolean
): SitemapUrlEntry[] => {
  const entries: SitemapUrlEntry[] = []

  for (const record of records) {
    // Strapi's public `find` already excludes drafts by default; this is a defensive backstop.
    if (!record.publishedAt || !isValidSlug(record.slug)) {
      continue
    }

    const explicitNoindex = record.seo?.noindex
    const isNoindexed = typeof explicitNoindex === 'boolean' ? explicitNoindex : globalNoindexFallback
    if (isNoindexed) {
      continue
    }

    const slug = record.slug!.trim().replace(/^\/+|\/+$/g, '')

    entries.push({
      loc: buildLoc(origin, `/${routePrefix}/${encodeURIComponent(slug)}`),
      lastmod: toIsoDate(record.updatedAt)
    })
  }

  return entries
}

const dedupeEntries = (entries: SitemapUrlEntry[]): SitemapUrlEntry[] => {
  const seen = new Map<string, SitemapUrlEntry>()
  for (const entry of entries) {
    if (!seen.has(entry.loc)) {
      seen.set(entry.loc, entry)
    }
  }
  return Array.from(seen.values())
}

export const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export const renderSitemapXml = (entries: SitemapUrlEntry[]): string => {
  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ''
      return `  <url>\n    <loc>${escapeXml(entry.loc)}</loc>${lastmod}\n  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export const generateSitemapPayload = async (): Promise<{ xml: string, success: boolean }> => {
  const origin = resolveSiteOrigin()
  const config = useRuntimeConfig()
  const strapiUrl = (config.public.strapiUrl || '').replace(/\/+$/, '')

  let success = true

  const globalNoindexFallback = strapiUrl
    ? await fetchGlobalNoindexFallback(strapiUrl).catch((error) => {
        success = false
        logSitemapError('global', error)
        return false
      })
    : false

  const sourceResults = await Promise.all(
    DYNAMIC_CONTENT_SOURCES.map(async (source) => {
      if (!strapiUrl) {
        return []
      }

      try {
        const records = await fetchSlugCollection(strapiUrl, source.collection)
        return toIndexableEntries(records, origin, source.routePrefix, globalNoindexFallback)
      }
      catch (error) {
        success = false
        logSitemapError(source.collection, error)
        return []
      }
    })
  )

  const entries: SitemapUrlEntry[] = [
    ...STATIC_PAGES.map((page) => ({ loc: buildLoc(origin, page.path) })),
    ...sourceResults.flat()
  ]

  const sorted = dedupeEntries(entries).sort((a, b) => a.loc.localeCompare(b.loc))

  return { xml: renderSitemapXml(sorted), success }
}

/**
 * Cache storage is Nitro's default `cache:` mount (unstorage). On the
 * `node-server` preset this is filesystem-backed and INSTANCE-LOCAL: each
 * running instance regenerates its own copy independently. If this app is
 * ever deployed across multiple instances/containers behind a load balancer,
 * configure a shared driver (e.g. Redis) via `nitro.storage.cache` in
 * `nuxt.config.ts` so all instances share one cached sitemap.
 */
export const getCachedSitemapXml = async (): Promise<string | null> => {
  const storage = useStorage('cache')
  const entry = await storage.getItem<SitemapCacheEntry>(CACHE_KEY)

  if (!entry || Date.now() >= entry.expiresAt) {
    return null
  }

  return entry.xml
}

export const setCachedSitemapXml = async (xml: string, success: boolean): Promise<void> => {
  const storage = useStorage('cache')
  const ttl = success ? SUCCESS_TTL_MS : FAILURE_TTL_MS
  await storage.setItem<SitemapCacheEntry>(CACHE_KEY, { xml, expiresAt: Date.now() + ttl })
}
