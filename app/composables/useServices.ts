import type { StrapiMedia } from '~/types/global'
import type {
  ServicesPageData,
  StrapiServiceItem,
  StrapiServicesCollectionResponse,
  StrapiServicesPageData,
  StrapiServicesPageResponse
} from '~/types/services'
import { resolveIconKey } from '~/utils/iconMap'

const pickText = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

const normalizePath = (value?: string | null) => {
  if (!value || typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const normalizeLink = (value?: string | null) => {
  if (!value || typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^(https?:|mailto:|tel:|#)/i.test(trimmed)) return trimmed
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const normalizeFeatureList = (value: unknown): string[] => {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => {
        if (typeof entry === 'string') return [entry]
        if (entry && typeof entry === 'object') {
          const record = entry as Record<string, unknown>
          const textValue = pickText(
            record.features as string,
            record.text as string,
            record.title as string,
            record.label as string,
            record.value as string
          )
          if (textValue) return [textValue]
        }
        return []
      })
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((line) => line.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean)
  }

  return []
}

const mergeAttributes = (data?: StrapiServicesPageData | null): StrapiServicesPageData => {
  if (!data) return {}
  if (!data.attributes) return data
  return { ...data.attributes, ...data }
}

const toRecord = (value: unknown): Record<string, unknown> => (
  value && typeof value === 'object' ? value as Record<string, unknown> : {}
)

const readEntity = (value: unknown): Record<string, unknown> => {
  const source = toRecord(value)
  const raw = source.data
  const nested = Array.isArray(raw) ? raw[0] : raw
  const record = toRecord(nested || value)
  const attributes = toRecord(record.attributes)
  return { ...attributes, ...record }
}

const readMediaUrl = (media?: StrapiMedia | string | Record<string, unknown> | null) => {
  if (!media) return ''
  if (typeof media === 'string') return media.trim()

  const normalized = readEntity(media)
  const formats = toRecord(normalized.formats)
  const large = toRecord(formats.large)
  const medium = toRecord(formats.medium)

  return pickText(
    large.url as string,
    medium.url as string,
    normalized.url as string
  )
}

const normalizeHeroCards = (value: unknown) => {
  if (!Array.isArray(value)) return []

  return value
    .map((item, index) => {
      const source = readEntity(item)
      const card = {
        id: String(source.id ?? `services-hero-card-${index}`),
        title: pickText(source.title as string),
        value: pickText(source.value as string),
        description: pickText(source.description as string),
        cardType: pickText(source.cardType as string),
        iconKey: resolveIconKey(source.iconKey),
        order: typeof source.order === 'number' ? source.order : index
      }

      if (!card.title && !card.value && !card.description) {
        return null
      }
      return card
    })
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
    .sort((a, b) => a.order - b.order)
}

const normalizeServicesSection = (value: unknown) => {
  const source = readEntity(value)
  return {
    label: pickText(source.label as string),
    title: pickText(source.title as string),
    highlightText: pickText(source.highlightText as string),
    subtitle: pickText(source.subtitle as string),
    alignment: pickText(source.alignment as string)
  }
}

const normalizeCtaSection = (
  value: unknown,
  toMediaUrl: (url?: string | null) => string
) => {
  if (!value) return null

  const source = readEntity(value)

  if (source.isEnabled === false) return null

  const eyebrow = pickText(source.eyebrow as string)
  const title = pickText(source.title as string)
  const description = pickText(source.description as string)
  const primaryButtonLabel = pickText(source.primaryButtonLabel as string)

  const hasContent = Boolean(eyebrow || title || description || primaryButtonLabel)
  if (!hasContent) return null

  return {
    isEnabled: true,
    eyebrow,
    title,
    description,
    primaryButton: {
      label: primaryButtonLabel,
      url: normalizeLink(pickText(source.primaryButtonUrl as string)),
      newTab: false
    },
    secondaryButton: {
      label: pickText(source.secondaryButtonLabel as string),
      url: normalizeLink(pickText(source.secondaryButtonUrl as string)),
      newTab: false
    },
    backgroundImage: toMediaUrl(readMediaUrl(source.backgroundImage as StrapiMedia | string | Record<string, unknown> | null)),
    variant: pickText(source.variant as string)
  }
}

const normalizeDeliveryProcess = (value: unknown) => {
  if (!Array.isArray(value)) return []

  const mapped = value
    .map((item, index) => {
      const source = readEntity(item)
      const orderSource = source.sortOrder ?? source.order
      const parsedOrder = typeof orderSource === 'number'
        ? orderSource
        : (typeof orderSource === 'string' && orderSource.trim() ? Number(orderSource) : undefined)
      const sortOrder = Number.isFinite(parsedOrder) ? parsedOrder : undefined
      const stepLabel = pickText(source.stepLabel as string, source.stepNumber as string)
      const entry = {
        id: String(source.id ?? `delivery-process-${index}`),
        stepLabel,
        title: pickText(source.title as string),
        description: pickText(source.description as string),
        sortOrder
      }

      if (!entry.title && !entry.description) return null
      return entry
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const hasSortOrder = mapped.some((item) => typeof item.sortOrder === 'number')
  if (!hasSortOrder) return mapped
  return [...mapped].sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER))
}

const normalizeConnectedPoints = (value: unknown) => {
  if (!Array.isArray(value)) return []

  const resolvePointIconKey = (source: Record<string, unknown>) => {
    const rawIconKey = source.iconKey as unknown
    const entityIconKey = readEntity(rawIconKey)
    return resolveIconKey(rawIconKey) || resolveIconKey(entityIconKey)
  }

  const mapped = value
    .map((item, index) => {
      const source = readEntity(item)
      const orderSource = source.order
      const parsedOrder = typeof orderSource === 'number'
        ? orderSource
        : (typeof orderSource === 'string' && orderSource.trim() ? Number(orderSource) : undefined)
      const order = Number.isFinite(parsedOrder) ? parsedOrder : undefined
      const point = {
        id: String(source.id ?? `connected-point-${index}`),
        iconKey: resolvePointIconKey(source),
        title: pickText(source.title as string),
        description: pickText(source.description as string),
        order
      }

      if (!point.title && !point.description && !point.iconKey) return null
      return point
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const hasOrder = mapped.some((item) => typeof item.order === 'number')
  if (!hasOrder) return mapped
  return [...mapped].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
}

const normalizeOrbitItems = (value: unknown) => {
  if (!Array.isArray(value)) return []

  const mapped = value
    .map((item, index) => {
      const source = readEntity(item)
      const orderSource = source.order
      const parsedOrder = typeof orderSource === 'number'
        ? orderSource
        : (typeof orderSource === 'string' && orderSource.trim() ? Number(orderSource) : undefined)
      const order = Number.isFinite(parsedOrder) ? parsedOrder : undefined
      const label = pickText(source.label as string, source.features as string)
      if (!label) return null
      return {
        id: String(source.id ?? `orbit-item-${index}`),
        label,
        order
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const hasOrder = mapped.some((item) => typeof item.order === 'number')
  if (!hasOrder) return mapped
  return [...mapped].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
}

const normalizeConnectedSolutions = (value: unknown) => {
  const source = readEntity(value)
  const pointsSource = source.points
    ?? source.connectedPoints
    ?? source.solutionPoints
    ?? source.items
  const orbitItemsSource = source.orbitItems
    ?? source.orbit
    ?? source.orbitPoints
    ?? source.features
  const normalized = {
    eyebrow: pickText(source.eyebrow as string),
    title: pickText(source.title as string),
    description: pickText(source.description as string),
    centerLabel: pickText(source.centerLabel as string),
    points: normalizeConnectedPoints(pointsSource),
    orbitItems: normalizeOrbitItems(orbitItemsSource)
  }

  const hasContent = Boolean(
    normalized.eyebrow
    || normalized.title
    || normalized.description
    || normalized.centerLabel
    || normalized.points.length
    || normalized.orbitItems.length
  )

  return hasContent ? normalized : null
}

const normalizeValueCards = (value: unknown) => {
  if (!Array.isArray(value)) return []

  const mapped = value
    .map((item, index) => {
      const source = readEntity(item)
      const iconCandidates = [
        source.iconKey,
        source.icon,
        source.cardIcon,
        source.valueIcon,
        source.benefitIcon,
        source.iconName,
        source.iconLabel
      ]
      const iconKey = iconCandidates
        .map((candidate) => resolveIconKey(candidate))
        .find((candidate) => Boolean(candidate))
        || ''
      const orderSource = source.order
      const parsedOrder = typeof orderSource === 'number'
        ? orderSource
        : (typeof orderSource === 'string' && orderSource.trim() ? Number(orderSource) : undefined)
      const order = Number.isFinite(parsedOrder) ? parsedOrder : undefined

      const card = {
        id: String(source.id ?? `services-value-card-${index}`),
        title: pickText(source.title as string),
        description: pickText(source.description as string),
        iconKey,
        order
      }

      if (!card.title && !card.description) return null
      return card
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const hasOrder = mapped.some((item) => typeof item.order === 'number')
  if (!hasOrder) return mapped
  return [...mapped].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
}

const normalizePartnershipStages = (value: unknown) => {
  if (!Array.isArray(value)) return []

  const mapped = value
    .map((item, index) => {
      const source = readEntity(item)
      const orderSource = source.sortOrder ?? source.order
      const parsedOrder = typeof orderSource === 'number'
        ? orderSource
        : (typeof orderSource === 'string' && orderSource.trim() ? Number(orderSource) : undefined)
      const order = Number.isFinite(parsedOrder) ? parsedOrder : undefined
      const ctaSource = readEntity(source.partnershipStageBtn || source.cta || source.button)
      const ctaUrl = normalizeLink(
        pickText(
          ctaSource.url as string,
          ctaSource.href as string,
          source.partnershipStageBtn as string,
          source.cta as string,
          source.button as string
        )
      )
      const bullets = normalizeFeatureList(
        source.bullets
        ?? source.checklist
        ?? source.features
        ?? source.items
      )

      const stage = {
        id: String(source.id ?? `services-partnership-stage-${index}`),
        title: pickText(source.title as string),
        description: pickText(source.description as string),
        iconKey: resolveIconKey(source.iconKey),
        bullets,
        ctaLabel: pickText(ctaSource.label as string, ctaSource.text as string),
        ctaUrl,
        ctaNewTab: Boolean(ctaSource.newTab ?? ctaSource.openNewTab ?? ctaSource.newWindow),
        featured: Boolean(source.featured ?? source.isFeatured ?? source.isRecommended),
        order
      }

      if (!stage.title && !stage.description) return null
      return stage
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const hasOrder = mapped.some((item) => typeof item.order === 'number')
  if (!hasOrder) return mapped
  return [...mapped].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
}

const normalizeFaqs = (value: unknown) => {
  if (!Array.isArray(value)) return []

  const mapped = value
    .map((item, index) => {
      const source = readEntity(item)
      const orderSource = source.sortOrder ?? source.order
      const parsedOrder = typeof orderSource === 'number'
        ? orderSource
        : (typeof orderSource === 'string' && orderSource.trim() ? Number(orderSource) : undefined)
      const order = Number.isFinite(parsedOrder) ? parsedOrder : undefined

      const faq = {
        id: String(source.id ?? `services-faq-${index}`),
        question: pickText(source.question as string),
        answer: pickText(source.answer as string),
        order
      }

      if (!faq.question || !faq.answer) return null
      return faq
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const hasOrder = mapped.some((item) => typeof item.order === 'number')
  if (!hasOrder) return mapped
  return [...mapped].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
}

const normalizeServiceCategory = (value: unknown) => {
  if (typeof value === 'string') return pickText(value)
  const source = readEntity(value)
  return pickText(
    source.name as string,
    source.title as string,
    source.label as string
  )
}

const normalizeServiceCards = (
  value: unknown,
  toMediaUrl: (url?: string | null) => string
) => {
  if (!Array.isArray(value)) return []

  const mapped = value
    .map((item, index) => {
      const source = readEntity(item as StrapiServiceItem)
      const orderSource = source.order
      const parsedOrder = typeof orderSource === 'number'
        ? orderSource
        : (typeof orderSource === 'string' && orderSource.trim() ? Number(orderSource) : undefined)
      const order = Number.isFinite(parsedOrder) ? parsedOrder : undefined
      const ctaLink = normalizeLink(pickText(source.ctaLink as string))
      const showcaseButton = readEntity(source.showcaseButton)
      const showcaseButtonUrl = normalizeLink(
        pickText(
          showcaseButton.url as string,
          showcaseButton.href as string,
          source.showcaseButton as string
        )
      )

      const card = {
        id: String(source.id ?? `service-card-${index}`),
        title: pickText(source.title as string),
        slug: pickText(source.slug as string),
        showcaseEyebrow: pickText(source.showcaseEyebrow as string),
        showcaseTitle: pickText(source.showcaseTitle as string),
        showcaseDescription: pickText(source.showcaseDescription as string),
        showcaseFeatures: normalizeFeatureList(source.showcaseFeatures),
        showcaseButtonLabel: pickText(showcaseButton.label as string, showcaseButton.text as string),
        showcaseButtonUrl,
        showcaseButtonNewTab: Boolean(showcaseButton.newTab ?? showcaseButton.openNewTab ?? showcaseButton.newWindow),
        shortDescription: pickText(source.shortDescription as string, source.description as string),
        description: source.description,
        iconKey: resolveIconKey(source.iconKey),
        featuredImage: toMediaUrl(readMediaUrl(source.featuredImage as StrapiMedia | string | Record<string, unknown> | null)),
        order,
        isFeatured: typeof source.isFeatured === 'boolean' ? source.isFeatured : undefined,
        ctaLink,
        cardActionButtonText: pickText(source.cardActionButtonText as string),
        serviceCategory: normalizeServiceCategory(source.serviceCategory)
      }

      if (!card.title && !card.shortDescription && !card.iconKey && !card.featuredImage) {
        return null
      }
      return card
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const hasOrder = mapped.some((item) => typeof item.order === 'number')
  if (!hasOrder) return mapped
  return [...mapped].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
}

const normalizeFinalCta = (
  value: unknown,
  toMediaUrl: (url?: string | null) => string
) => {
  const source = readEntity(value)
  const primary = readEntity(source.primaryButton || source.button)
  const secondary = readEntity(source.secondaryButton)

  return {
    title: pickText(source.title as string),
    description: pickText(source.description as string),
    primaryButton: {
      label: pickText(primary.label as string, primary.text as string),
      url: normalizeLink(pickText(primary.url as string, primary.href as string)),
      newTab: Boolean(primary.newTab ?? primary.openNewTab ?? primary.newWindow)
    },
    secondaryButton: {
      label: pickText(secondary.label as string, secondary.text as string),
      url: normalizeLink(pickText(secondary.url as string, secondary.href as string)),
      newTab: Boolean(secondary.newTab ?? secondary.openNewTab ?? secondary.newWindow)
    },
    backgroundImage: toMediaUrl(readMediaUrl(source.backgroundImage as StrapiMedia | string | Record<string, unknown> | null)),
    variant: pickText(source.variant as string)
  }
}

const normalizeServices = (
  response: StrapiServicesPageResponse | null,
  serviceCollectionResponse: StrapiServicesCollectionResponse | null,
  toMediaUrl: (url?: string | null) => string
): ServicesPageData => {
  const entry = mergeAttributes(response?.data)
  const hero = readEntity(entry.hero || {})
  const seo = readEntity(entry.seo || {})
  const primaryButton = readEntity(hero.primaryButton)
  const secondaryButton = readEntity(hero.secondaryButton)
  const faqSectionValue = (entry as Record<string, unknown>).faqSection
  const ctaSectionValue = (entry as Record<string, unknown>).ctaSection
  const finalCtaValue = (entry as Record<string, unknown>).finalCta
    || (entry as Record<string, unknown>).cta
    || (entry as Record<string, unknown>).finalCTA
    || (entry as Record<string, unknown>).servicesCta

  return {
    hero: {
      eyebrowText: pickText(hero.eyebrowText as string),
      title: pickText(hero.title as string),
      highlightText: pickText(hero.highlightText as string),
      description: pickText(hero.description as string),
      heroImage: toMediaUrl(readMediaUrl(hero.heroImage as StrapiMedia | string | Record<string, unknown> | null)),
      backgroundImage: toMediaUrl(readMediaUrl(hero.backgroundImage as StrapiMedia | string | Record<string, unknown> | null)),
      primaryButtonText: pickText(primaryButton.label as string, primaryButton.text as string),
      primaryButtonUrl: normalizeLink(pickText(primaryButton.url as string, primaryButton.href as string)),
      primaryButtonNewTab: Boolean(primaryButton.newTab ?? primaryButton.openNewTab ?? primaryButton.newWindow),
      secondaryButtonText: pickText(secondaryButton.label as string, secondaryButton.text as string),
      secondaryButtonUrl: normalizeLink(pickText(secondaryButton.url as string, secondaryButton.href as string)),
      secondaryButtonNewTab: Boolean(secondaryButton.newTab ?? secondaryButton.openNewTab ?? secondaryButton.newWindow),
      alignment: pickText(hero.alignment as string),
      variant: pickText(hero.variant as string)
    },
    heroFloatingCards: normalizeHeroCards(
      hero.heroFloatingCard
      || hero.heroFloatingCards
      || hero.floatingCards
      || hero.cards
      || entry.heroFloatingCards
      || entry.heroFloatingCard
      || (entry as Record<string, unknown>).floatingCards
    ),
    servicesSection: normalizeServicesSection(entry.servicesSection),
    featuredServicesSection: normalizeServicesSection(entry.featuredServicesSection),
    deliveryProcessSection: normalizeServicesSection(
      entry.deliveryProcessSection
      || entry.deliveryProcessHeading
      || readEntity((entry as Record<string, unknown>).processHeading)
      || readEntity((entry as Record<string, unknown>).howWeDeliverHeading)
      || readEntity((entry as Record<string, unknown>).howWeDeliverSection)
    ),
    deliveryProcess: normalizeDeliveryProcess(
      entry.deliveryProcess
      || (entry as Record<string, unknown>).processSection
      || (entry as Record<string, unknown>).howWeDeliverProcess
      || (entry as Record<string, unknown>).serviceDeliveryProcess
    ),
    connectedSolutions: normalizeConnectedSolutions(
      entry.connectedSolutions
      || (entry as Record<string, unknown>).connectedSolution
      || (entry as Record<string, unknown>).serviceConnectedSolutions
    ),
    valueCardsSection: normalizeServicesSection(
      (entry as Record<string, unknown>).benefitsSectionHeading
      || entry.valueCardsSection
      || (entry as Record<string, unknown>).valueSection
      || (entry as Record<string, unknown>).valuesSection
      || (entry as Record<string, unknown>).whyChooseHeading
      || (entry as Record<string, unknown>).valueHeading
    ),
    valueCards: normalizeValueCards(
      (entry as Record<string, unknown>).benefits
      || (entry as Record<string, unknown>).valueCards
      || (entry as Record<string, unknown>).valuesCards
      || (entry as Record<string, unknown>).valueItems
      || (entry as Record<string, unknown>).values
      || (entry as Record<string, unknown>).whyChooseCards
    ),
    partnershipStagesSection: normalizeServicesSection(
      (entry as Record<string, unknown>).partnershipStagesHeading
      || (entry as Record<string, unknown>).partnershipStagesHeader
      || (entry as Record<string, unknown>).partnershipStagesSection
      || (entry as Record<string, unknown>).servicePartnershipStagesSection
      || (entry as Record<string, unknown>).stagesSection
      || (entry as Record<string, unknown>).partnershipSection
    ),
    partnershipStages: normalizePartnershipStages(
      (entry as Record<string, unknown>).partnershipStages
      || (entry as Record<string, unknown>).servicePartnershipStages
      || (entry as Record<string, unknown>).stages
    ),
    faqSection: normalizeServicesSection(
      (entry as Record<string, unknown>).faqHeading
      || (entry as Record<string, unknown>).faqsHeading
      || (!Array.isArray(faqSectionValue) ? faqSectionValue : undefined)
      || (entry as Record<string, unknown>).frequentlyAskedQuestionsHeading
    ),
    faqs: normalizeFaqs(
      (entry as Record<string, unknown>).faqs
      || (entry as Record<string, unknown>).faqItems
      || (entry as Record<string, unknown>).faqSection
      || (entry as Record<string, unknown>).frequentlyAskedQuestions
    ),
    serviceCards: normalizeServiceCards(serviceCollectionResponse?.data || [], toMediaUrl),
    ctaSection: normalizeCtaSection(ctaSectionValue, toMediaUrl),
    seo: {
      metaTitle: pickText(seo.metaTitle as string),
      metaDescription: pickText(seo.metaDescription as string),
      metaImage: toMediaUrl(readMediaUrl(seo.metaImage as StrapiMedia | string | Record<string, unknown> | null)),
      canonicalPath: normalizePath(seo.canonicalPath as string),
      noindex: typeof seo.noindex === 'boolean' ? seo.noindex : undefined,
      nofollow: typeof seo.nofollow === 'boolean' ? seo.nofollow : undefined
    },
    finalCta: normalizeFinalCta(finalCtaValue, toMediaUrl)
  }
}

const readStatusCode = (error: unknown) => {
  const source = error as {
    statusCode?: number
    status?: number
    response?: { status?: number }
  }
  return source?.statusCode || source?.status || source?.response?.status || 0
}

export const useServices = async () => {
  const { buildApiUrl, toMediaUrl } = useStrapi()

  const candidateEndpoints = [
    buildApiUrl('/api/services-page?populate[hero][populate]=*&populate[servicesSection]=*&populate[ctaSection][populate]=*&populate[featuredServicesSection]=*&populate[benefitsSectionHeading]=*&populate[benefits][populate]=*&populate[partnershipStagesHeading]=*&populate[partnershipStages][populate]=*&populate[faqHeading]=*&populate[faqSection]=*&populate[processHeading]=true&populate[processSection]=true&populate[connectedSolutions][populate][points][populate]=*&populate[connectedSolutions][populate][orbitItems][populate]=*&populate[seo][populate]=*'),
    buildApiUrl('/api/services-page?populate[hero][populate]=*&populate[servicesSection]=*&populate[ctaSection][populate]=*&populate[featuredServicesSection]=*&populate[partnershipStagesHeading]=*&populate[partnershipStages][populate]=*&populate[faqHeading]=*&populate[faqSection]=*&populate[connectedSolutions][populate][points][populate]=*&populate[connectedSolutions][populate][orbitItems][populate]=*&populate[seo][populate]=*'),
    buildApiUrl('/api/services-page?populate=*'),
    buildApiUrl('/api/services?populate[hero][populate]=*&populate[seo][populate]=*'),
    buildApiUrl('/api/services?populate=*')
  ]

  const resolvedEndpoint = ref(candidateEndpoints[0])
  const serviceCollectionEndpoint = buildApiUrl('/api/services?populate[featuredImage][populate]=*&populate[showcaseFeatures]=*&populate[showcaseButton]=*&populate[iconKey][fields][0]=iconKey&sort[0]=order:asc')

  const pageDataAsync = useAsyncData<StrapiServicesPageResponse, Error | null>('services-page-content', async () => {
    let lastError: unknown = null

    for (const endpoint of candidateEndpoints) {
      try {
        const response = await $fetch<StrapiServicesPageResponse>(endpoint)
        resolvedEndpoint.value = endpoint
        return response
      } catch (requestError) {
        lastError = requestError
        if (readStatusCode(requestError) !== 400 && readStatusCode(requestError) !== 404) {
          throw requestError
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Failed to fetch services page content.')
  }, {
    server: true,
    default: () => ({ data: null })
  })

  const collectionDataAsync = useAsyncData<StrapiServicesCollectionResponse, Error | null>('services-collection-content', async () => {
    return await $fetch<StrapiServicesCollectionResponse>(serviceCollectionEndpoint)
  }, {
    server: true,
    default: () => ({ data: [] })
  })

  const [{ data, pending, error }, { data: serviceCollectionData, pending: serviceCollectionPending, error: serviceCollectionError }] = await Promise.all([
    pageDataAsync,
    collectionDataAsync
  ])

  const services = computed<ServicesPageData>(() => normalizeServices(
    data.value || null,
    serviceCollectionData.value || null,
    toMediaUrl
  ))

  return {
    services,
    pending: computed(() => pending.value || serviceCollectionPending.value),
    error: computed(() => error.value || serviceCollectionError.value),
    endpoint: resolvedEndpoint
  }
}
