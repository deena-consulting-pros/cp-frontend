import {
  buildAbsoluteUrl,
  normalizeAbsoluteUrl
} from '~/utils/schema'
import {
  buildRobotsContent,
  getOgTypeByPage,
  hasPaginationQuery,
  stripHash,
  toSecureUrl
} from '~/utils/meta'
import type {
  HeadMetaTagInput,
  PageMetaInput
} from '~/utils/meta'

export const usePageMeta = (input: PageMetaInput) => {
  const route = useRoute()
  const { resolveImageUrl } = useStrapi()
  const defaults = useSeoDefaults()

  const siteUrl = normalizeAbsoluteUrl(defaults.siteUrl) || 'http://localhost:3000'

  const canonicalSource = input.canonicalPath || defaults.defaultSeo.canonicalPath || route.path
  const isPaginated = hasPaginationQuery(route.query as Record<string, unknown>)
  const canonicalPath = isPaginated ? route.path : stripHash(canonicalSource)
  const canonicalUrl = buildAbsoluteUrl(canonicalPath, siteUrl)

  const siteName = defaults.siteName || 'Consulting Pros'
  const description = input.description || defaults.defaultSeo.metaDescription || defaults.siteDescription || ''
  const ogType = getOgTypeByPage(input.pageType)
  const robots = buildRobotsContent({
    isPaginated,
    noindex: input.noindex ?? defaults.defaultSeo.noindex,
    nofollow: input.nofollow ?? defaults.defaultSeo.nofollow
  })

  const fallbackOgImage = defaults.defaultOgImage || defaults.defaultSeo.metaImage || defaults.siteLogo || ''
  const imageSource = input.image?.url || fallbackOgImage || ''
  const imageUrl = resolveImageUrl(imageSource, siteUrl)
  const imageSecureUrl = toSecureUrl(imageUrl)
  const imageAlt = input.image?.alt || siteName

  const twitterCard = imageUrl ? 'summary_large_image' : 'summary'

  useSeoMeta({
    title: input.title,
    description,
    ogType,
    ogTitle: input.title,
    ogDescription: description,
    ogUrl: canonicalUrl,
    ogSiteName: siteName,
    twitterCard,
    twitterTitle: input.title,
    twitterDescription: description,
    twitterSite: defaults.twitterSite || undefined
  })

  const meta: HeadMetaTagInput[] = [
    {
      key: 'robots',
      name: 'robots',
      content: robots
    }
  ]

  if (imageUrl) {
    meta.push({
      key: 'og:image',
      property: 'og:image',
      content: imageUrl
    })

    if (imageSecureUrl) {
      meta.push({
        key: 'og:image:secure_url',
        property: 'og:image:secure_url',
        content: imageSecureUrl
      })
    }

    if (typeof input.image?.width === 'number') {
      meta.push({
        key: 'og:image:width',
        property: 'og:image:width',
        content: String(input.image.width)
      })
    }

    if (typeof input.image?.height === 'number') {
      meta.push({
        key: 'og:image:height',
        property: 'og:image:height',
        content: String(input.image.height)
      })
    }

    if (imageAlt) {
      meta.push({
        key: 'og:image:alt',
        property: 'og:image:alt',
        content: imageAlt
      })
    }

    meta.push({
      key: 'twitter:image',
      name: 'twitter:image',
      content: imageUrl
    })

    if (imageAlt) {
      meta.push({
        key: 'twitter:image:alt',
        name: 'twitter:image:alt',
        content: imageAlt
      })
    }
  }

  if (input.pageType === 'product') {
    const currency = input.product?.currency || defaults.defaultCurrency || ''
    const amount = input.product?.priceAmount

    if (amount !== undefined && amount !== null && String(amount).trim()) {
      meta.push({
        key: 'product:price:amount',
        property: 'product:price:amount',
        content: String(amount)
      })
    }

    if (currency) {
      meta.push({
        key: 'product:price:currency',
        property: 'product:price:currency',
        content: currency
      })
    }
  }

  const faviconType = (() => {
    const url = defaults.favicon
    if (!url) return ''
    if (url.endsWith('.png')) return 'image/png'
    if (url.endsWith('.svg')) return 'image/svg+xml'
    if (url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'image/jpeg'
    if (url.endsWith('.ico')) return 'image/x-icon'
    return ''
  })()

  useHead({
    link: [
      ...(defaults.favicon
        ? [{
            key: 'favicon',
            rel: 'icon',
            type: faviconType || undefined,
            href: defaults.favicon
          }]
        : []),
      {
        key: 'canonical',
        rel: 'canonical',
        href: canonicalUrl
      }
    ],
    meta
  })

  return {
    canonicalUrl,
    siteUrl,
    siteName,
    description,
    robots,
    isPaginated
  }
}
