import type { HomepageData, HomepageFeaturedService, StrapiHomepageData, StrapiHomepageResponse, StrapiWhyChooseCard } from '~/types/homepage'
import type { StrapiMedia } from '~/types/global'

type RawRecord = Record<string, unknown>

const pickText = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

const normalizePath = (value?: string | null) => {
  if (!value || typeof value !== 'string') {
    return ''
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const normalizeLink = (value?: string | null) => {
  if (!value || typeof value !== 'string') {
    return ''
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  if (/^(https?:|mailto:|tel:|#)/i.test(trimmed)) {
    return trimmed
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const mergeAttributes = (data?: StrapiHomepageData | null): StrapiHomepageData => {
  if (!data) {
    return {}
  }

  if (!data.attributes) {
    return data
  }

  return {
    ...data.attributes,
    ...data
  }
}

type MediaWithFormats = {
  url?: string | null
  formats?: Record<string, { url?: string | null } | undefined>
  data?: {
    url?: string | null
    attributes?: {
      url?: string | null
      formats?: Record<string, { url?: string | null } | undefined>
    } | null
  } | null
}

const readMediaUrl = (media?: StrapiMedia | string | null) => {
  if (!media) {
    return ''
  }

  if (typeof media === 'string') {
    return media.trim()
  }

  const m = media as MediaWithFormats
  const formats = m.formats
  const dataFormats = m.data?.attributes?.formats

  return pickText(
    formats?.large?.url,
    dataFormats?.large?.url,
    formats?.medium?.url,
    dataFormats?.medium?.url,
    media.url,
    media.data?.url,
    media.data?.attributes?.url
  )
}

const readMediaAlt = (media?: StrapiMedia | string | null) => {
  if (!media || typeof media === 'string') {
    return ''
  }

  return pickText(
    media.alternativeText,
    media.data?.alternativeText,
    media.data?.attributes?.alternativeText
  )
}

const readMediaDimension = (
  media: StrapiMedia | string | null | undefined,
  key: 'width' | 'height'
) => {
  if (!media || typeof media === 'string') {
    return 0
  }

  const sources = [
    media,
    media.data,
    media.data?.attributes
  ] as Array<Record<string, unknown> | null | undefined>

  for (const source of sources) {
    const value = source?.[key]
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value
    }
  }

  return 0
}

const toRawRecord = (item: unknown): RawRecord => {
  if (typeof item !== 'object' || !item) return {}
  const raw = item as { attributes?: RawRecord | null }
  return raw.attributes ?? (item as RawRecord)
}

const normalizeFeaturedServices = (value: unknown, toMediaUrl: (url?: string | null) => string): HomepageFeaturedService[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item, index) => {
      const source = toRawRecord(item)
      const fallbackUrl = typeof source.slug === 'string' ? source.slug : ''

      const service: HomepageFeaturedService = {
        id: String((item as { id?: string | number })?.id ?? index),
        title: pickText(
          source.title as string,
          source.name as string,
          source.heading as string
        ),
        description: pickText(
          source.description as string,
          source.summary as string,
          source.subtitle as string
        ),
        shortDescription: pickText(
          source.shortDescription as string,
          source.description as string,
          source.summary as string,
          source.subtitle as string
        ),
        slug: pickText(source.slug as string),
        iconKey: pickText(source.iconKey as string),
        featuredImage: toMediaUrl(readMediaUrl(source.featuredImage as StrapiMedia)),
        url: normalizeLink(
          (source.url as string)
            || (source.href as string)
            || fallbackUrl
        ),
        buttonText: pickText(
          source.buttonText as string,
          source.ctaText as string,
          source.linkText as string
        ),
        icon: toMediaUrl(readMediaUrl(source.icon as StrapiMedia)),
        order: Number(source.order) || 0,
        isFeatured: typeof source.isFeatured === 'boolean' ? source.isFeatured : true
      }

      if (!service.title && !service.description && !service.url) {
        return null
      }

      return service
    })
    .filter((service): service is HomepageFeaturedService => Boolean(service))
}

const normalizeTrustedLogos = (value: unknown, toMediaUrl: (url?: string | null) => string) => {
  const source = Array.isArray(value)
    ? value
    : (value as { data?: unknown })?.data

  if (!Array.isArray(source)) {
    return []
  }

  return source
    .map((item, index) => {
      const raw = typeof item === 'object' && item
        ? (item as RawRecord)
        : {}
      const attrs = (raw.attributes as RawRecord | undefined) || raw

      const name = pickText(attrs.name as string)
      const logoMedia = attrs.logo as StrapiMedia
      const logo = toMediaUrl(readMediaUrl(logoMedia))
      const logoWidth = readMediaDimension(logoMedia, 'width') || 160
      const logoHeight = readMediaDimension(logoMedia, 'height') || 48
      const order = Number(attrs.order) || 0
      const isActive = typeof attrs.isActive === 'boolean' ? attrs.isActive : true

      if (!name && !logo) {
        return null
      }

      return {
        id: String(raw.id ?? index),
        name,
        logo,
        logoWidth,
        logoHeight,
        url: normalizeLink(attrs.url as string),
        order,
        isActive
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
}

const normalizeHeroFloatingCards = (value: unknown) => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item, index) => {
      const source = toRawRecord(item)
      const title = pickText(source.title as string)

      const card = {
        id: String((item as { id?: string | number })?.id ?? index),
        title,
        value: pickText(source.value as string),
        description: pickText(source.description as string),
        iconKey: pickText(source.iconKey as string),
        cardType: pickText(source.cardType as string),
        order: Number(source.order) || 0
      }

      if (!card.title && !card.value && !card.description) {
        return null
      }

      return card
    })
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
}

const normalizeServicesHeading = (value: unknown) => {
  const source = typeof value === 'object' && value !== null
    ? (value as RawRecord)
    : {}
  return {
    label: pickText(source.label as string),
    title: pickText(source.title as string),
    subtitle: pickText(source.subtitle as string),
    highlightText: pickText(source.highlightText as string),
    alignment: pickText(source.alignment as string)
  }
}

const normalizeWhyChooseCards = (value: unknown) => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item, index) => {
      const source = toRawRecord(item as StrapiWhyChooseCard)
      const card = {
        id: String((item as { id?: string | number })?.id ?? index),
        title: pickText(source.title as string),
        description: pickText(source.description as string),
        iconKey: pickText(source.iconKey as string),
        order: Number(source.order) || 0
      }

      if (!card.title && !card.description) {
        return null
      }

      return card
    })
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
}

const normalizeProcessHeading = (value: unknown) => {
  const source = typeof value === 'object' && value !== null
    ? (value as RawRecord)
    : {}

  return {
    label: pickText(source.label as string),
    title: pickText(source.title as string),
    subtitle: pickText(source.subtitle as string),
    highlightText: pickText(source.highlightText as string),
    alignment: pickText(source.alignment as string)
  }
}

const normalizeProcessSteps = (value: unknown) => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item, index) => {
      const source = toRawRecord(item)
      const orderSource = source.order
      const order = typeof orderSource === 'number'
        ? orderSource
        : (typeof orderSource === 'string' && orderSource.trim() ? Number(orderSource) : undefined)

      const step = {
        id: String((item as { id?: string | number })?.id ?? index),
        stepNumber: pickText(
          typeof source.stepNumber === 'number' ? String(source.stepNumber) : source.stepNumber as string
        ),
        title: pickText(source.title as string),
        description: pickText(source.description as string),
        iconKey: pickText(source.iconKey as string),
        order: Number.isFinite(order) ? order : undefined
      }

      if (!step.title && !step.description) {
        return null
      }

      return step
    })
    .filter((step): step is NonNullable<typeof step> => Boolean(step))
}

const normalizePortfolioHeading = (value: unknown) => {
  const source = typeof value === 'object' && value !== null
    ? (value as RawRecord)
    : {}

  return {
    label: pickText(source.label as string),
    title: pickText(source.title as string),
    subtitle: pickText(source.subtitle as string),
    highlightText: pickText(source.highlightText as string),
    alignment: pickText(source.alignment as string)
  }
}

const normalizePortfolioButton = (value: unknown) => {
  const source = typeof value === 'object' && value !== null
    ? (value as RawRecord)
    : {}

  return {
    label: pickText(source.label as string),
    url: normalizeLink(source.url as string),
    newTab: Boolean(source.newTab)
  }
}

const normalizePortfolioItems = (value: unknown, toMediaUrl: (url?: string | null) => string) => {
  if (!Array.isArray(value)) {
    return []
  }

  const mapped = value
    .map((item, index) => {
      const source = toRawRecord(item)
      const orderSource = source.order
      const order = typeof orderSource === 'number'
        ? orderSource
        : (typeof orderSource === 'string' && orderSource.trim() ? Number(orderSource) : undefined)
      const isFeatured = typeof source.isFeatured === 'boolean' ? source.isFeatured : undefined

      const normalized = {
        id: String((item as { id?: string | number })?.id ?? index),
        title: pickText(source.title as string),
        slug: pickText(source.slug as string),
        category: pickText(source.category as string),
        shortDescription: pickText(source.shortDescription as string, source.description as string),
        thumbnail: toMediaUrl(readMediaUrl(source.thumbnail as StrapiMedia)),
        featuredImage: toMediaUrl(readMediaUrl(source.featuredImage as StrapiMedia)),
        projectUrl: normalizeLink(source.projectUrl as string),
        buttonText: pickText(source.buttonText as string),
        order: Number.isFinite(order) ? order : undefined,
        isFeatured
      }

      if (!normalized.title && !normalized.shortDescription && !normalized.thumbnail && !normalized.featuredImage) {
        return null
      }

      return normalized
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const hasFeaturedFlag = mapped.some((item) => typeof item.isFeatured === 'boolean')
  const featuredFiltered = hasFeaturedFlag ? mapped.filter((item) => item.isFeatured) : mapped
  const hasOrder = featuredFiltered.some((item) => typeof item.order === 'number')

  return hasOrder
    ? [...featuredFiltered].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
    : featuredFiltered
}

const normalizeTestimonialsHeading = (value: unknown) => {
  const source = typeof value === 'object' && value !== null
    ? (value as RawRecord)
    : {}

  return {
    label: pickText(source.label as string),
    title: pickText(source.title as string),
    subtitle: pickText(source.subtitle as string),
    highlightText: pickText(source.highlightText as string),
    alignment: pickText(source.alignment as string)
  }
}

const normalizeTestimonials = (value: unknown, toMediaUrl: (url?: string | null) => string) => {
  if (!Array.isArray(value)) {
    return []
  }

  const mapped = value
    .map((item, index) => {
      const source = toRawRecord(item)
      const orderSource = source.order
      const order = typeof orderSource === 'number'
        ? orderSource
        : (typeof orderSource === 'string' && orderSource.trim() ? Number(orderSource) : undefined)
      const ratingSource = typeof source.rating === 'number'
        ? source.rating
        : (typeof source.rating === 'string' && source.rating.trim() ? Number(source.rating) : 0)
      const rating = Math.max(0, Math.min(5, Math.round(Number.isFinite(ratingSource) ? ratingSource : 0)))
      const isActive = typeof source.isActive === 'boolean' ? source.isActive : undefined

      const testimonial = {
        id: String((item as { id?: string | number })?.id ?? index),
        quote: pickText(source.quote as string),
        clientName: pickText(source.clientName as string),
        clientPosition: pickText(source.clientPosition as string),
        companyName: pickText(source.companyName as string),
        rating,
        clientImage: toMediaUrl(readMediaUrl(source.clientImage as StrapiMedia)),
        order: Number.isFinite(order) ? order : undefined,
        isActive
      }

      if (!testimonial.quote && !testimonial.clientName) {
        return null
      }

      return testimonial
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const hasIsActive = mapped.some((item) => typeof item.isActive === 'boolean')
  const activeFiltered = hasIsActive ? mapped.filter((item) => item.isActive) : mapped
  const hasOrder = activeFiltered.some((item) => typeof item.order === 'number')

  return hasOrder
    ? [...activeFiltered].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
    : activeFiltered
}

const normalizeHomepage = (response: StrapiHomepageResponse | null, toMediaUrl: (url?: string | null) => string): HomepageData => {
  const entry = mergeAttributes(response?.data)
  const hero = entry.hero || {}
  const seo = entry.seo || {}
  const ctaFromEntry = entry.cta || {}
  const finalCta = entry.finalCta || {}
  const trustedHeading = entry.trustedHeading || {}
  const trustedLogos = normalizeTrustedLogos(entry.trustedLogos, toMediaUrl)
  const whyChooseHeading = entry.whyChooseHeading || {}
  const whyChooseImageUrl = toMediaUrl(readMediaUrl(entry.whyChooseImage))
  const whyChooseBackgroundImageUrl = toMediaUrl(readMediaUrl(entry.whyChooseBackgroundImage))
  const processSteps = normalizeProcessSteps(entry.processSteps)
  const hasProcessOrder = processSteps.some((step) => typeof step.order === 'number')

  return {
    hero: {
      title: pickText(hero.title),
      eyebrowText: pickText(hero.eyebrowText),
      highlightText: pickText(hero.highlightText),
      description: pickText(hero.description, hero.subtitle),
      heroImage: toMediaUrl(readMediaUrl(hero.heroImage || hero.image)),
      backgroundImage: toMediaUrl(readMediaUrl(hero.backgroundImage)),
      primaryButtonText: pickText(
        hero.primaryButton?.text,
        hero.primaryButton?.label,
        hero.primaryButtonText
      ),
      primaryButtonUrl: normalizeLink(
        hero.primaryButton?.url
        || hero.primaryButton?.href
        || hero.primaryButtonUrl
      ),
      secondaryButtonText: pickText(
        hero.secondaryButton?.text,
        hero.secondaryButton?.label,
        hero.secondaryButtonText
      ),
      secondaryButtonUrl: normalizeLink(
        hero.secondaryButton?.url
        || hero.secondaryButton?.href
        || hero.secondaryButtonUrl
      ),
      alignment: pickText(hero.alignment),
      variant: pickText(hero.variant),
      subtitle: pickText(hero.subtitle),
      image: toMediaUrl(readMediaUrl(hero.image))
    },
    heroFloatingCards: normalizeHeroFloatingCards(
      entry.heroFloatingCards
      || entry.heroFloatingCard
      || hero.heroFloatingCard
    )
      .sort((a, b) => a.order - b.order),
    introTitle: pickText(entry.introTitle),
    introDescription: pickText(entry.introDescription),
    servicesHeading: normalizeServicesHeading(entry.servicesHeading),
    featuredServices: normalizeFeaturedServices(entry.featuredServices, toMediaUrl),
    cta: {
      title: pickText(ctaFromEntry.title, entry.ctaTitle),
      description: pickText(ctaFromEntry.description, entry.ctaDescription),
      buttonText: pickText(ctaFromEntry.buttonText, entry.ctaButtonText),
      buttonUrl: normalizeLink(ctaFromEntry.buttonUrl || entry.ctaButtonUrl),
      secondaryButtonText: pickText(ctaFromEntry.secondaryButtonText, entry.ctaSecondaryButtonText),
      secondaryButtonUrl: normalizeLink(ctaFromEntry.secondaryButtonUrl || entry.ctaSecondaryButtonUrl)
    },
    finalCta: {
      title: pickText(finalCta.title),
      description: pickText(finalCta.description),
      button: {
        label: pickText(finalCta.button?.label),
        url: normalizeLink(finalCta.button?.url),
        newTab: Boolean(finalCta.button?.newTab)
      },
      backgroundImage: toMediaUrl(readMediaUrl(finalCta.backgroundImage)),
      variant: pickText(finalCta.variant)
    },
    trustedHeading: {
      label: pickText(trustedHeading.label),
      title: pickText(trustedHeading.title),
      subtitle: pickText(trustedHeading.subtitle),
      highlightText: pickText(trustedHeading.highlightText),
      alignment: pickText(trustedHeading.alignment)
    },
    trustedLogos: trustedLogos.sort((a, b) => a.order - b.order),
    whyChooseHeading: {
      label: pickText(whyChooseHeading.label),
      title: pickText(whyChooseHeading.title),
      subtitle: pickText(whyChooseHeading.subtitle),
      highlightText: pickText(whyChooseHeading.highlightText),
      alignment: pickText(whyChooseHeading.alignment)
    },
    whyChooseCards: normalizeWhyChooseCards(entry.whyChooseCards).sort((a, b) => a.order - b.order),
    whyChooseImage: {
      url: whyChooseImageUrl,
      alt: pickText(readMediaAlt(entry.whyChooseImage), 'Consulting Pros strategy team')
    },
    whyChooseBackgroundImage: {
      url: whyChooseBackgroundImageUrl,
      alt: pickText(readMediaAlt(entry.whyChooseBackgroundImage))
    },
    processHeading: normalizeProcessHeading(entry.processHeading),
    processSteps: hasProcessOrder
      ? [...processSteps].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
      : processSteps,
    portfolioHeading: normalizePortfolioHeading(entry.portfolioHeading),
    portfolioButton: normalizePortfolioButton(entry.portfolioButton),
    portfolioItems: normalizePortfolioItems(entry.portfolioItems, toMediaUrl),
    testimonialsHeading: normalizeTestimonialsHeading(entry.testimonialsHeading),
    testimonials: normalizeTestimonials(entry.testimonials, toMediaUrl),
    seo: {
      metaTitle: pickText(seo.metaTitle),
      metaDescription: pickText(seo.metaDescription),
      metaImage: toMediaUrl(readMediaUrl(seo.metaImage)),
      canonicalPath: normalizePath(seo.canonicalPath),
      noindex: typeof seo.noindex === 'boolean' ? seo.noindex : undefined,
      nofollow: typeof seo.nofollow === 'boolean' ? seo.nofollow : undefined
    }
  }
}

const readStatusCode = (error: unknown) => {
  const source = error as {
    statusCode?: number
    status?: number
    response?: {
      status?: number
    }
  }

  return source?.statusCode || source?.status || source?.response?.status || 0
}

export const useHomepage = async () => {
  const { buildApiUrl, toMediaUrl } = useStrapi()
  const candidateEndpoints = [
    buildApiUrl('/api/homepage?populate[hero][populate]=*&populate[seo][populate]=*&populate[trustedLogos][populate]=*&populate[trustedHeading][populate]=*&populate[servicesHeading][populate]=*&populate[featuredServices][populate]=*&populate[whyChooseHeading][populate]=*&populate[whyChooseCards][populate]=*&populate[whyChooseImage][populate]=*&populate[whyChooseBackgroundImage][populate]=*&populate[processHeading][populate]=*&populate[processSteps][populate]=*&populate[portfolioHeading][populate]=*&populate[portfolioButton][populate]=*&populate[portfolioItems][populate]=*&populate[testimonialsHeading][populate]=*&populate[testimonials][populate]=*&populate[finalCta][populate]=*'),
    buildApiUrl('/api/homepage?populate=*'),
    buildApiUrl('/api/homepage')
  ]
  const resolvedEndpoint = ref(candidateEndpoints[0])

  const { data, pending, error } = await useAsyncData<StrapiHomepageResponse, Error | null>('homepage-content', async () => {
    let lastError: unknown = null

    for (const endpoint of candidateEndpoints) {
      try {
        const response = await $fetch<StrapiHomepageResponse>(endpoint)
        resolvedEndpoint.value = endpoint
        return response
      } catch (requestError) {
        lastError = requestError
        if (readStatusCode(requestError) !== 400) {
          throw requestError
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Failed to fetch homepage content.')
  }, {
    server: true,
    default: () => ({ data: null })
  })

  const homepage = computed<HomepageData>(() => normalizeHomepage(data.value || null, toMediaUrl))

  return {
    homepage,
    pending,
    error,
    endpoint: resolvedEndpoint
  }
}
