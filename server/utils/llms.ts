import { decodeHtmlEntities, stripHtml } from '../../app/utils/strapiRichText'
import {
  DYNAMIC_CONTENT_SOURCES,
  FAILURE_TTL_MS,
  STATIC_PAGES,
  SUCCESS_TTL_MS,
  buildDynamicEntryUrl,
  buildLoc,
  fetchSlugCollection,
  isPublishedAndIndexable,
  isValidSlug,
  logStrapiFetchError,
  resolveSiteOrigin
} from './sitemap'
import type { StrapiSlugRecord } from './sitemap'

/** llms.txt: a plain-text list of Consulting Pros FZC's key indexable pages for AI/LLM tools. */
const FALLBACK_SITE_NAME = 'Consulting Pros FZC'

const STATIC_PAGE_COPY: Record<string, { title: string, description: string }> = {
  '/': {
    title: 'Home',
    description: 'Overview of Consulting Pros FZC and the consulting services offered.'
  },
  '/about': {
    title: 'About',
    description: 'Information about Consulting Pros FZC as an organization.'
  },
  '/services': {
    title: 'Services',
    description: 'Directory of consulting and delivery services offered by Consulting Pros FZC.'
  },
  '/contact': {
    title: 'Contact',
    description: 'Contact details and inquiry options for reaching Consulting Pros FZC.'
  }
}

/** Maps each sitemap content source to the plain-text field llms.txt may summarize with. */
const DESCRIPTION_FIELD_BY_COLLECTION: Record<string, 'shortDescription' | 'description'> = {
  services: 'shortDescription',
  'legal-pages': 'description'
}

const LLMS_SECTION_TITLE_BY_COLLECTION: Record<string, string> = {
  services: 'Services',
  'legal-pages': 'Legal'
}

interface StrapiGlobalLlmsData {
  siteName?: string | null
  siteDescription?: string | null
  defaultSeo?: { noindex?: boolean | null } | null
}

interface StrapiGlobalLlmsResponse {
  data?: StrapiGlobalLlmsData | null
}

interface LlmsLinkEntry {
  title: string
  url: string
  description?: string
}

interface LlmsSection {
  title: string
  entries: LlmsLinkEntry[]
}

const CACHE_KEY = 'llms:txt'

interface LlmsCacheEntry {
  text: string
  expiresAt: number
}

/** Strips HTML/rich-text artifacts, collapses whitespace, and escapes Markdown control characters. */
const sanitizeInline = (value?: string | null, maxLength?: number): string => {
  if (typeof value !== 'string' || !value.trim()) {
    return ''
  }

  const plain = decodeHtmlEntities(stripHtml(value)).replace(/\s+/g, ' ').trim()
  if (!plain) {
    return ''
  }

  const limited = maxLength && plain.length > maxLength
    ? `${plain.slice(0, maxLength).trim()}…`
    : plain

  return limited.replace(/([\\`*_[\]#|])/g, '\\$1')
}

const fetchGlobalInfo = async (strapiUrl: string): Promise<{ siteName: string, siteDescription: string, noindexFallback: boolean }> => {
  const endpoint = `${strapiUrl}/api/global?fields[0]=siteName&fields[1]=siteDescription&populate[defaultSeo][fields][0]=noindex`
  const response = await $fetch<StrapiGlobalLlmsResponse>(endpoint)
  const data = response?.data

  return {
    siteName: sanitizeInline(data?.siteName, 120),
    siteDescription: sanitizeInline(data?.siteDescription, 400),
    noindexFallback: typeof data?.defaultSeo?.noindex === 'boolean' ? data.defaultSeo.noindex : false
  }
}

const toLlmsEntries = (
  records: StrapiSlugRecord[],
  origin: string,
  routePrefix: string,
  descriptionField: 'shortDescription' | 'description',
  globalNoindexFallback: boolean
): LlmsLinkEntry[] => {
  const entries: LlmsLinkEntry[] = []

  for (const record of records) {
    if (!isValidSlug(record.slug) || !isPublishedAndIndexable(record, globalNoindexFallback)) {
      continue
    }

    const title = sanitizeInline(record.title, 120)
    if (!title) {
      continue
    }

    const url = buildDynamicEntryUrl(origin, routePrefix, record.slug!)
    const description = sanitizeInline(record[descriptionField], 200)

    entries.push({ title, url, description: description || undefined })
  }

  return entries
}

const renderLinkLine = (entry: LlmsLinkEntry): string =>
  entry.description ? `- [${entry.title}](${entry.url}): ${entry.description}` : `- [${entry.title}](${entry.url})`

const renderLlmsTxt = (input: {
  siteName: string
  siteDescription: string
  origin: string
  sections: LlmsSection[]
}): string => {
  const lines: string[] = []

  lines.push(`# ${input.siteName || FALLBACK_SITE_NAME}`, '')

  if (input.siteDescription) {
    lines.push(`> ${input.siteDescription}`, '')
  }

  lines.push('## Main Pages')
  for (const page of STATIC_PAGES) {
    const copy = STATIC_PAGE_COPY[page.path]
    if (!copy) {
      continue
    }
    lines.push(`- [${copy.title}](${buildLoc(input.origin, page.path)}): ${copy.description}`)
  }
  lines.push('')

  for (const section of input.sections) {
    if (!section.entries.length) {
      continue
    }
    lines.push(`## ${section.title}`)
    for (const entry of section.entries) {
      lines.push(renderLinkLine(entry))
    }
    lines.push('')
  }

  lines.push('## Additional Resources')
  lines.push(`- [XML Sitemap](${buildLoc(input.origin, '/sitemap.xml')}): Index of canonical, indexable website pages.`)

  return `${lines.join('\n').trimEnd()}\n`
}

export const generateLlmsPayload = async (): Promise<{ text: string, success: boolean }> => {
  const origin = resolveSiteOrigin()
  const config = useRuntimeConfig()
  const strapiUrl = (config.public.strapiUrl || '').replace(/\/+$/, '')

  const globalInfo = strapiUrl
    ? await fetchGlobalInfo(strapiUrl).catch((error) => {
        logStrapiFetchError('llms', 'global', error)
        return null
      })
    : { siteName: '', siteDescription: '', noindexFallback: false }

  if (!globalInfo) {
    // The global request failed, so the inherited noindex fallback used by
    // isPublishedAndIndexable() is unknown. Fetching/rendering dynamic
    // service/legal entries would risk exposing pages that should be
    // noindexed, so fall back to a static-only, minimal file instead.
    return {
      text: renderLlmsTxt({ siteName: '', siteDescription: '', origin, sections: [] }),
      success: false
    }
  }

  let success = true

  const sections = await Promise.all(
    DYNAMIC_CONTENT_SOURCES.map(async (source): Promise<LlmsSection> => {
      const title = LLMS_SECTION_TITLE_BY_COLLECTION[source.collection] || source.collection
      const descriptionField = DESCRIPTION_FIELD_BY_COLLECTION[source.collection] || 'description'

      if (!strapiUrl) {
        return { title, entries: [] }
      }

      try {
        const records = await fetchSlugCollection(strapiUrl, source.collection, [descriptionField, 'title'])
        return { title, entries: toLlmsEntries(records, origin, source.routePrefix, descriptionField, globalInfo.noindexFallback) }
      }
      catch (error) {
        success = false
        logStrapiFetchError('llms', source.collection, error)
        return { title, entries: [] }
      }
    })
  )

  const text = renderLlmsTxt({
    siteName: globalInfo.siteName,
    siteDescription: globalInfo.siteDescription,
    origin,
    sections
  })

  return { text, success }
}

export const getCachedLlmsTxt = async (): Promise<string | null> => {
  const storage = useStorage('cache')
  const entry = await storage.getItem<LlmsCacheEntry>(CACHE_KEY)

  if (!entry || Date.now() >= entry.expiresAt) {
    return null
  }

  return entry.text
}

export const setCachedLlmsTxt = async (text: string, success: boolean): Promise<void> => {
  const storage = useStorage('cache')
  const ttl = success ? SUCCESS_TTL_MS : FAILURE_TTL_MS
  await storage.setItem<LlmsCacheEntry>(CACHE_KEY, { text, expiresAt: Date.now() + ttl })
}
