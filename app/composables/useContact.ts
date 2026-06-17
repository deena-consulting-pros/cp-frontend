import type { StrapiMedia } from '~/types/global'
import type {
  ContactFaqItem,
  ContactInfoCard,
  ContactNextStep,
  ContactPageData,
  ContactSectionHeading,
  ContactServiceOption,
  StrapiContactPageData,
  StrapiContactPageResponse
} from '~/types/contact'
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

const unwrapCollection = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value
  const source = toRecord(value)
  if (Array.isArray(source.data)) return source.data
  return []
}

const mergeAttributes = (data?: StrapiContactPageData | null): StrapiContactPageData => {
  if (!data) return {}
  if (!data.attributes) return data
  return { ...data.attributes, ...data }
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

const normalizeHeading = (value: unknown, fallbackTitle = ''): ContactSectionHeading => {
  const source = readEntity(value)

  return {
    label: pickText(source.label as string, source.eyebrow as string),
    title: pickText(source.title as string, source.heading as string, fallbackTitle),
    highlightText: pickText(source.highlightText as string),
    subtitle: pickText(source.subtitle as string, source.description as string),
    alignment: pickText(source.alignment as string)
  }
}

const normalizeHeroPoints = (value: unknown) => {
  return unwrapCollection(value)
    .map((item, index) => {
      const source = readEntity(item)
      return {
        id: String(source.id ?? `contact-hero-point-${index}`),
        text: pickText(source.text as string, source.title as string, source.label as string),
        iconKey: resolveIconKey(source.iconKey),
        order: typeof source.order === 'number' ? source.order : index
      }
    })
    .filter((item) => Boolean(item.text))
    .sort((a, b) => a.order - b.order)
}

const normalizeServiceOptions = (value: unknown): ContactServiceOption[] => {
  return unwrapCollection(value)
    .map((item, index) => {
      const source = readEntity(item)
      const label = pickText(source.label as string, source.title as string, source.name as string)
      return {
        id: String(source.id ?? `contact-service-option-${index}`),
        label,
        value: pickText(source.value as string, label),
        order: typeof source.order === 'number' ? source.order : index
      }
    })
    .filter((item) => Boolean(item.label))
    .sort((a, b) => a.order - b.order)
}

const normalizeContactInfoCards = (value: unknown): ContactInfoCard[] => {
  return unwrapCollection(value)
    .map((item, index) => {
      const source = readEntity(item)
      return {
        id: String(source.id ?? `contact-info-card-${index}`),
        title: pickText(source.title as string),
        description: pickText(source.description as string),
        linkLabel: pickText(source.linkLabel as string, source.label as string, source.ctaLabel as string, source.value as string),
        linkUrl: normalizeLink(pickText(source.linkUrl as string, source.url as string, source.href as string)),
        iconKey: resolveIconKey(source.iconKey),
        order: typeof source.order === 'number' ? source.order : index
      }
    })
    .filter((item) => Boolean(item.title || item.linkLabel || item.description))
    .sort((a, b) => a.order - b.order)
}

const normalizeNextSteps = (value: unknown): ContactNextStep[] => {
  return unwrapCollection(value)
    .map((item, index) => {
      const source = readEntity(item)
      return {
        id: String(source.id ?? `contact-next-step-${index}`),
        title: pickText(source.title as string),
        description: pickText(source.description as string),
        iconKey: resolveIconKey(source.iconKey),
        order: typeof source.order === 'number' ? source.order : index
      }
    })
    .filter((item) => Boolean(item.title || item.description))
    .sort((a, b) => a.order - b.order)
}

const normalizeFaq = (value: unknown): ContactFaqItem[] => {
  return unwrapCollection(value)
    .map((item, index) => {
      const source = readEntity(item)
      return {
        id: String(source.id ?? `contact-faq-${index}`),
        question: pickText(source.question as string),
        answer: pickText(source.answer as string),
        order: typeof source.order === 'number' ? source.order : index
      }
    })
    .filter((item) => Boolean(item.question && item.answer))
    .sort((a, b) => a.order - b.order)
}

const normalizeContactPage = (
  response: StrapiContactPageResponse | null,
  toMediaUrl: (url?: string | null) => string
): ContactPageData => {
  const entry = mergeAttributes(response?.data)
  const seo = readEntity(entry.seo || {})
  const hero = readEntity(entry.hero || {})
  const heroPrimary = readEntity(hero.primaryButton)
  const formHeading = normalizeHeading(entry.contactFormSection, 'Tell Us About Your Project')
  const finalCtaSource = readEntity(entry.finalCta)
  const finalCtaButton = readEntity(finalCtaSource.button)

  return {
    seo: {
      metaTitle: pickText(seo.metaTitle as string),
      metaDescription: pickText(seo.metaDescription as string),
      metaImage: toMediaUrl(readMediaUrl(seo.metaImage as StrapiMedia | string | Record<string, unknown> | null)),
      canonicalPath: normalizePath(seo.canonicalPath as string),
      noindex: typeof seo.noindex === 'boolean' ? seo.noindex : undefined,
      nofollow: typeof seo.nofollow === 'boolean' ? seo.nofollow : undefined
    },
    showHeroImage: entry.showHeroImage !== false,
    hero: {
      eyebrowText: pickText(hero.eyebrowText as string, hero.label as string),
      title: pickText(hero.title as string),
      highlightText: pickText(hero.highlightText as string),
      description: pickText(hero.description as string),
      heroImage: toMediaUrl(readMediaUrl(hero.heroImage as StrapiMedia | string | Record<string, unknown> | null)),
      primaryButtonText: pickText(heroPrimary.label as string, heroPrimary.text as string, hero.primaryButtonText as string),
      primaryButtonUrl: normalizeLink(pickText(heroPrimary.url as string, heroPrimary.href as string, hero.primaryButtonUrl as string)),
      primaryButtonNewTab: Boolean(heroPrimary.newTab ?? heroPrimary.openNewTab ?? heroPrimary.newWindow)
    },
    heroPoints: normalizeHeroPoints(entry.heroPoints),
    contactFormSection: formHeading,
    submitButtonLabel: pickText((entry.submitButtonLabel as string), (readEntity(entry.contactFormSection).submitButtonLabel as string), 'Send Message'),
    helperText: pickText((entry.helperText as string), (readEntity(entry.contactFormSection).helperText as string)),
    serviceOptions: normalizeServiceOptions(entry.serviceOptions),
    contactInfoCards: normalizeContactInfoCards(entry.contactInfoCards),
    nextStepsHeading: {
      ...normalizeHeading(entry.nextStepsHeading, 'A Simple Way to Start'),
      label: pickText(normalizeHeading(entry.nextStepsHeading).label, 'WHAT HAPPENS NEXT'),
      subtitle: pickText(
        normalizeHeading(entry.nextStepsHeading).subtitle,
        "Once you send your message, we'll review your needs and suggest a practical next step."
      )
    },
    nextSteps: normalizeNextSteps(entry.nextSteps),
    faqHeading: {
      ...normalizeHeading(entry.faqHeading, 'Before You Contact Us'),
      label: pickText(normalizeHeading(entry.faqHeading).label, 'QUESTIONS'),
      subtitle: pickText(
        normalizeHeading(entry.faqHeading).subtitle,
        'Here are a few quick answers before you send your message.'
      )
    },
    faqSection: normalizeFaq(entry.faqSection),
    finalCta: {
      title: pickText(finalCtaSource.title as string, 'Ready to talk about your digital presence?'),
      description: pickText(finalCtaSource.description as string, "Send us a message and we'll help you understand the next best step."),
      button: {
        label: pickText(finalCtaButton.label as string, finalCtaButton.text as string, 'Contact Consulting Pros'),
        url: normalizeLink(pickText(finalCtaButton.url as string, finalCtaButton.href as string, '#contact-form')),
        newTab: Boolean(finalCtaButton.newTab ?? finalCtaButton.openNewTab ?? finalCtaButton.newWindow)
      }
    }
  }
}

export const useContact = async () => {
  const { buildApiUrl, toMediaUrl } = useStrapi()
  const endpoint = buildApiUrl('/api/contact-page?populate[seo][populate]=*&populate[hero][populate]=*&populate[heroPoints][populate]=*&populate[contactFormSection][populate]=*&populate[serviceOptions][populate]=*&populate[contactInfoCards][populate]=*&populate[nextStepsHeading][populate]=*&populate[nextSteps][populate]=*&populate[faqHeading][populate]=*&populate[faqSection][populate]=*&populate[finalCta][populate]=*')

  const { data, pending, error } = await useAsyncData<StrapiContactPageResponse, Error | null>('contact-page-content', async () => {
    return await $fetch<StrapiContactPageResponse>(endpoint)
  }, {
    server: true,
    default: () => ({ data: null })
  })

  const contact = computed<ContactPageData>(() => normalizeContactPage(data.value || null, toMediaUrl))

  return {
    contact,
    pending,
    error,
    endpoint: ref(endpoint)
  }
}
