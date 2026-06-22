import type {
  AboutApproachStep,
  AboutCompetency,
  AboutData,
  AboutEdgeItem,
  AboutExpertItem,
  AboutHeroCard,
  AboutMissionVisionCard,
  AboutPillarItem,
  AboutSectionHeading,
  AboutValueItem,
  AboutStoryParagraph,
  StrapiAboutData,
  StrapiAboutResponse
} from '~/types/about'
import type { StrapiMedia } from '~/types/global'
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

const mergeAttributes = (data?: StrapiAboutData | null): StrapiAboutData => {
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

const toRecord = (value: unknown): Record<string, unknown> => (
  value && typeof value === 'object' ? value as Record<string, unknown> : {}
)

const readEntity = (value: unknown): Record<string, unknown> => {
  const source = toRecord(value)
  const raw = source.data
  const nested = Array.isArray(raw) ? raw[0] : raw
  const record = toRecord(nested || value)
  const attributes = toRecord(record.attributes)

  return {
    ...attributes,
    ...record
  }
}

const unwrapCollection = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value
  }

  const source = toRecord(value)
  if (Array.isArray(source.data)) {
    return source.data
  }

  return []
}

const readMediaUrl = (media?: StrapiMedia | string | Record<string, unknown> | null) => {
  if (!media) {
    return ''
  }

  if (typeof media === 'string') {
    return media.trim()
  }

  const normalizedMedia = readEntity(media)
  const formats = toRecord(normalizedMedia.formats)
  const large = toRecord(formats.large)
  const medium = toRecord(formats.medium)

  return pickText(
    normalizedMedia.url as string,
    large.url as string,
    medium.url as string
  )
}

const toArray = (value: unknown) => (Array.isArray(value) ? value : [])

const toBoolean = (value: unknown) => typeof value === 'boolean' ? value : false

const normalizeHeroCards = (value: unknown): AboutHeroCard[] => {
  return unwrapCollection(value)
    .map((item, index) => {
      const source = readEntity(item)
      return {
        id: String(source.id ?? `hero-card-${index}`),
        title: pickText(source.title as string),
        value: pickText(source.value as string),
        description: pickText(source.description as string),
        iconKey: resolveIconKey(source.iconKey),
        cardType: pickText(source.cardType as string),
        order: typeof source.order === 'number' ? source.order : index
      }
    })
    .filter((item) => Boolean(item.title || item.value || item.description))
    .sort((a, b) => a.order - b.order)
}

const normalizeStoryHeading = (value: unknown): AboutSectionHeading => {
  const source = readEntity(value)

  if (!Object.keys(source).length && typeof value === 'string') {
    return {
      label: '',
      title: pickText(value),
      highlightText: '',
      subtitle: '',
      alignment: ''
    }
  }

  return {
    label: pickText(source.label as string),
    title: pickText(source.title as string, source.heading as string),
    highlightText: pickText(source.highlightText as string),
    subtitle: pickText(source.subtitle as string, source.description as string),
    alignment: pickText(source.alignment as string)
  }
}

const normalizeStoryParagraphs = (value: unknown): AboutStoryParagraph[] => {
  if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
    return (value as string[])
      .filter(item => item.trim())
      .map((content, index) => ({
        content: content.trim(),
        order: index
      }))
  }

  return unwrapCollection(value)
    .map((item, index) => {
      const source = readEntity(item)
      return {
        content: pickText(source.content as string, source.text as string, source.paragraph as string),
        order: typeof source.order === 'number' ? source.order : index
      }
    })
    .filter(item => Boolean(item.content))
    .sort((a, b) => a.order - b.order)
}

const normalizeCompetencies = (value: unknown): AboutCompetency[] => {
  return unwrapCollection(value)
    .map((item, index) => {
      const source = readEntity(item)
      return {
        label: pickText(source.label as string, source.title as string, source.name as string),
        iconKey: resolveIconKey(source.iconKey),
        order: typeof source.order === 'number' ? source.order : index
      }
    })
    .filter(item => Boolean(item.label))
    .sort((a, b) => a.order - b.order)
}

const normalizeMissionVisionCards = (value: unknown): AboutMissionVisionCard[] => {
  return unwrapCollection(value)
    .map((item, index) => {
      const source = readEntity(item)

      return {
        id: String(source.id ?? `mission-vision-card-${index}`),
        title: pickText(source.title as string),
        description: pickText(source.description as string),
        iconKey: resolveIconKey(source.iconKey),
        order: typeof source.order === 'number' ? source.order : index
      }
    })
    .filter(item => Boolean(item.title || item.description))
    .sort((a, b) => a.order - b.order)
}

const normalizeValuesHeading = (value: unknown): AboutSectionHeading => {
  const source = readEntity(value)

  if (!Object.keys(source).length && typeof value === 'string') {
    return {
      label: '',
      title: pickText(value),
      highlightText: '',
      subtitle: '',
      alignment: 'center'
    }
  }

  return {
    label: pickText(source.label as string),
    title: pickText(source.title as string, source.heading as string),
    highlightText: pickText(source.highlightText as string),
    subtitle: pickText(source.subtitle as string, source.description as string),
    alignment: pickText(source.alignment as string, 'center')
  }
}

const normalizeValues = (value: unknown): AboutValueItem[] => {
  return unwrapCollection(value)
    .map((item, index) => {
      const source = readEntity(item)

      return {
        id: String(source.id ?? `about-value-${index}`),
        title: pickText(source.title as string),
        description: pickText(source.description as string),
        iconKey: resolveIconKey(source.iconKey),
        order: typeof source.order === 'number' ? source.order : index
      }
    })
    .filter(item => Boolean(item.title || item.description))
    .sort((a, b) => a.order - b.order)
}

const normalizePillarsHeading = (value: unknown): AboutSectionHeading => {
  const source = readEntity(value)

  if (!Object.keys(source).length && typeof value === 'string') {
    return {
      label: '',
      title: pickText(value),
      highlightText: '',
      subtitle: '',
      alignment: 'left'
    }
  }

  return {
    label: pickText(source.label as string),
    title: pickText(source.title as string, source.heading as string),
    highlightText: pickText(source.highlightText as string),
    subtitle: pickText(source.subtitle as string, source.description as string),
    alignment: pickText(source.alignment as string, 'left')
  }
}

const normalizePillars = (value: unknown, toMediaUrl: (url?: string | null) => string): AboutPillarItem[] => {
  return unwrapCollection(value)
    .map((item, index) => {
      const source = readEntity(item)
      const linkSource = readEntity(source.link)
      const imageUrl = toMediaUrl(readMediaUrl(source.image as StrapiMedia | string | Record<string, unknown> | null))

      return {
        id: String(source.id ?? `about-pillar-${index}`),
        title: pickText(source.title as string),
        description: pickText(source.description as string),
        iconKey: resolveIconKey(source.iconKey),
        image: imageUrl,
        link: normalizeLink(pickText(
          source.link as string,
          linkSource.url as string,
          linkSource.href as string
        )),
        variant: pickText(source.variant as string),
        order: typeof source.order === 'number' ? source.order : index
      }
    })
    .filter(item => Boolean(item.title || item.description))
    .sort((a, b) => a.order - b.order)
}

const normalizeEdgeHeading = (value: unknown): AboutSectionHeading => {
  const source = readEntity(value)

  if (!Object.keys(source).length && typeof value === 'string') {
    return {
      label: '',
      title: pickText(value),
      highlightText: '',
      subtitle: '',
      alignment: 'left'
    }
  }

  return {
    label: pickText(source.label as string),
    title: pickText(source.title as string, source.heading as string),
    highlightText: pickText(source.highlightText as string),
    subtitle: pickText(source.subtitle as string, source.description as string),
    alignment: pickText(source.alignment as string, 'left')
  }
}

const normalizeEdgeItems = (value: unknown): AboutEdgeItem[] => {
  return unwrapCollection(value)
    .map((item, index) => {
      const source = readEntity(item)

      return {
        id: String(source.id ?? `about-edge-item-${index}`),
        title: pickText(source.title as string),
        description: pickText(source.description as string),
        iconKey: resolveIconKey(source.iconKey),
        order: typeof source.order === 'number' ? source.order : index
      }
    })
    .filter(item => Boolean(item.title || item.description))
    .sort((a, b) => a.order - b.order)
}

const normalizeApproachHeading = (value: unknown): AboutSectionHeading => {
  const source = readEntity(value)

  if (!Object.keys(source).length && typeof value === 'string') {
    return {
      label: '',
      title: pickText(value),
      highlightText: '',
      subtitle: '',
      alignment: 'center'
    }
  }

  return {
    label: pickText(source.label as string),
    title: pickText(source.title as string, source.heading as string),
    highlightText: pickText(source.highlightText as string),
    subtitle: pickText(source.subtitle as string, source.description as string),
    alignment: pickText(source.alignment as string, 'center')
  }
}

const normalizeApproachSteps = (value: unknown): AboutApproachStep[] => {
  return unwrapCollection(value)
    .map((item, index) => {
      const source = readEntity(item)

      return {
        id: String(source.id ?? `about-approach-step-${index}`),
        stepNumber: pickText(source.stepNumber as string),
        title: pickText(source.title as string),
        description: pickText(source.description as string),
        iconKey: pickText(source.iconKey as string),
        order: typeof source.order === 'number' ? source.order : index
      }
    })
    .filter(item => Boolean(item.title || item.description))
    .sort((a, b) => a.order - b.order)
}

const normalizeExpertsHeading = (value: unknown): AboutSectionHeading => {
  const source = readEntity(value)

  if (!Object.keys(source).length && typeof value === 'string') {
    return {
      label: '',
      title: pickText(value),
      highlightText: '',
      subtitle: '',
      alignment: 'left'
    }
  }

  return {
    label: pickText(source.label as string),
    title: pickText(source.title as string, source.heading as string),
    highlightText: pickText(source.highlightText as string),
    subtitle: pickText(source.subtitle as string, source.description as string),
    alignment: pickText(source.alignment as string, 'left')
  }
}

const normalizeExperts = (value: unknown): AboutExpertItem[] => {
  return unwrapCollection(value)
    .map((item, index) => {
      const source = readEntity(item)

      return {
        id: String(source.id ?? `about-expert-${index}`),
        title: pickText(source.title as string, source.name as string),
        role: pickText(source.role as string, source.category as string),
        description: pickText(source.description as string, source.bio as string),
        image: source.image || null,
        iconKey: resolveIconKey(source.iconKey),
        order: typeof source.order === 'number' ? source.order : index,
        isActive: typeof source.isActive === 'boolean' ? source.isActive : true
      }
    })
    .filter(item => Boolean(item.title || item.role || item.description || item.image))
    .filter(item => item.isActive !== false)
    .sort((a, b) => a.order - b.order)
}

const normalizeFinalCta = (value: unknown, toMediaUrl: (url?: string | null) => string) => {
  const source = readEntity(value)
  const button = readEntity(source.button)

  return {
    title: pickText(source.title as string),
    description: pickText(source.description as string),
    button: {
      label: pickText(button.label as string, button.text as string),
      url: normalizeLink(pickText(button.url as string, button.href as string)),
      newTab: toBoolean(button.newTab),
      openNewTab: toBoolean(button.openNewTab ?? button.newWindow)
    },
    backgroundImage: toMediaUrl(readMediaUrl(source.backgroundImage as StrapiMedia | string | Record<string, unknown> | null)),
    variant: pickText(source.variant as string)
  }
}

const normalizeAbout = (response: StrapiAboutResponse | null, toMediaUrl: (url?: string | null) => string): AboutData => {
  const root = mergeAttributes(response?.data)
  const entry = mergeAttributes(
    (root.data && typeof root.data === 'object' ? root.data as StrapiAboutData : null)
    || root
  )
  const seo = entry.seo || {}
  const hero = readEntity(entry.hero || {})
  const primaryButton = readEntity(hero.primaryButton)
  const secondaryButton = readEntity(hero.secondaryButton)

  return {
    seo: {
      metaTitle: pickText(seo.metaTitle),
      metaDescription: pickText(seo.metaDescription),
      metaImage: toMediaUrl(readMediaUrl(seo.metaImage as StrapiMedia | string | null)),
      canonicalPath: normalizePath(seo.canonicalPath),
      noindex: typeof seo.noindex === 'boolean' ? seo.noindex : undefined,
      nofollow: typeof seo.nofollow === 'boolean' ? seo.nofollow : undefined
    },
    hero: {
      eyebrowText: pickText(hero.eyebrowText as string),
      title: pickText(hero.title as string),
      highlightText: pickText(hero.highlightText as string),
      description: pickText(hero.description as string),
      heroImage: toMediaUrl(readMediaUrl(hero.heroImage as StrapiMedia | string | Record<string, unknown> | null)),
      backgroundImage: toMediaUrl(readMediaUrl(hero.backgroundImage as StrapiMedia | string | Record<string, unknown> | null)),
      primaryButtonText: pickText(
        primaryButton.text as string,
        primaryButton.label as string,
        hero.primaryButtonText as string
      ),
      primaryButtonUrl: normalizeLink(pickText(
        primaryButton.url as string,
        primaryButton.href as string,
        hero.primaryButtonUrl as string
      )),
      primaryButtonNewTab: toBoolean(primaryButton.newTab ?? primaryButton.openNewTab ?? primaryButton.newWindow),
      secondaryButtonText: pickText(
        secondaryButton.text as string,
        secondaryButton.label as string,
        hero.secondaryButtonText as string
      ),
      secondaryButtonUrl: normalizeLink(pickText(
        secondaryButton.url as string,
        secondaryButton.href as string,
        hero.secondaryButtonUrl as string
      )),
      secondaryButtonNewTab: toBoolean(secondaryButton.newTab ?? secondaryButton.openNewTab ?? secondaryButton.newWindow),
      alignment: pickText(hero.alignment as string),
      variant: pickText(hero.variant as string)
    },
    heroCards: normalizeHeroCards(
      entry.heroCards
      || hero.heroFloatingCard
      || entry.heroFloatingCards
      || entry.heroFloatingCard
    ),
    storyHeading: normalizeStoryHeading(entry.storyHeading),
    storyParagraphs: normalizeStoryParagraphs(entry.storyParagraphs),
    competenciesTitle: pickText(entry.competenciesTitle as string),
    competencies: normalizeCompetencies(entry.competencies),
    missionVisionCards: normalizeMissionVisionCards(entry.missionVisionCards),
    valuesHeading: normalizeValuesHeading(entry.valuesHeading),
    values: normalizeValues(entry.values),
    pillarsHeading: normalizePillarsHeading(entry.pillarsHeading),
    pillars: normalizePillars(entry.pillars, toMediaUrl),
    edgeHeading: normalizeEdgeHeading(entry.edgeHeading),
    edgeItems: normalizeEdgeItems(entry.edgeItems),
    edgeImage: toMediaUrl(readMediaUrl(entry.edgeImage as StrapiMedia | string | Record<string, unknown> | null)),
    showHeroImage: entry.showHeroImage === true,
    approachHeading: normalizeApproachHeading(entry.approachHeading),
    approachSteps: normalizeApproachSteps(entry.approachSteps),
    expertsHeading: normalizeExpertsHeading(entry.expertsHeading),
    experts: normalizeExperts(entry.experts),
    finalCta: normalizeFinalCta(entry.finalCta, toMediaUrl)
  }
}

export const useAbout = async () => {
  const { buildApiUrl, toMediaUrl } = useStrapi()
  const aboutEndpoint = buildApiUrl('/api/about?populate[seo][populate]=*&populate[hero][populate]=*&populate[storyHeading][populate]=*&populate[storyParagraphs][populate]=*&populate[competencies][populate]=*&populate[missionVisionCards][populate]=*&populate[valuesHeading][populate]=*&populate[values][populate]=*&populate[pillarsHeading][populate]=*&populate[pillars][populate]=*&populate[edgeHeading][populate]=*&populate[edgeItems][populate]=*&populate[edgeImage][populate]=*&populate[approachHeading][populate]=*&populate[approachSteps][populate]=*&populate[expertsHeading][populate]=*&populate[experts][populate]=*&populate[finalCta][populate]=*')
  const resolvedEndpoint = ref(aboutEndpoint)

  const { data, pending, error } = await useAsyncData<StrapiAboutResponse, Error | null>('about-content', async () => {
    const response = await $fetch<StrapiAboutResponse>(aboutEndpoint)
    resolvedEndpoint.value = aboutEndpoint
    return response
  }, {
    server: true,
    default: () => ({ data: null })
  })

  const about = computed<AboutData>(() => normalizeAbout(data.value || null, toMediaUrl))

  return {
    about,
    pending,
    error,
    endpoint: resolvedEndpoint
  }
}
