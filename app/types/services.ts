import type { StrapiMedia } from '~/types/global'

export interface StrapiServicesHeroButton {
  label?: string | null
  text?: string | null
  url?: string | null
  href?: string | null
  newTab?: boolean | null
  openNewTab?: boolean | null
  newWindow?: boolean | null
}

export interface StrapiServicesHeroCard {
  id?: number | string
  title?: string | null
  value?: string | null
  description?: string | null
  cardType?: string | null
  iconKey?: string | { iconKey?: string | null } | null
  order?: number | null
  attributes?: StrapiServicesHeroCard | null
}

export interface StrapiServicesHero {
  eyebrowText?: string | null
  title?: string | null
  highlightText?: string | null
  description?: string | null
  heroImage?: StrapiMedia | string | null
  backgroundImage?: StrapiMedia | string | null
  primaryButton?: StrapiServicesHeroButton | null
  secondaryButton?: StrapiServicesHeroButton | null
  alignment?: string | null
  variant?: string | null
  heroFloatingCard?: StrapiServicesHeroCard[] | null
}

export interface StrapiServicesSeo {
  metaTitle?: string | null
  metaDescription?: string | null
  metaImage?: StrapiMedia | string | null
  canonicalPath?: string | null
  noindex?: boolean | null
  nofollow?: boolean | null
}

export interface StrapiServicesCtaButton {
  label?: string | null
  text?: string | null
  url?: string | null
  href?: string | null
  newTab?: boolean | null
  openNewTab?: boolean | null
  newWindow?: boolean | null
}

export interface StrapiServicesFinalCta {
  title?: string | null
  description?: string | null
  button?: StrapiServicesCtaButton | null
  primaryButton?: StrapiServicesCtaButton | null
  secondaryButton?: StrapiServicesCtaButton | null
  backgroundImage?: StrapiMedia | string | null
  variant?: string | null
}

export interface StrapiServicesCtaSection {
  isEnabled?: boolean | null
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  primaryButtonLabel?: string | null
  primaryButtonUrl?: string | null
  secondaryButtonLabel?: string | null
  secondaryButtonUrl?: string | null
  backgroundImage?: StrapiMedia | string | null
  variant?: string | null
}

export interface StrapiServicesPageData {
  hero?: StrapiServicesHero | null
  servicesSection?: {
    label?: string | null
    title?: string | null
    highlightText?: string | null
    subtitle?: string | null
    alignment?: string | null
  } | null
  featuredServicesSection?: {
    label?: string | null
    title?: string | null
    highlightText?: string | null
    subtitle?: string | null
    alignment?: string | null
  } | null
  ctaSection?: StrapiServicesCtaSection | null
  deliveryProcessSection?: {
    label?: string | null
    title?: string | null
    highlightText?: string | null
    subtitle?: string | null
    alignment?: string | null
  } | null
  deliveryProcessHeading?: {
    label?: string | null
    title?: string | null
    highlightText?: string | null
    subtitle?: string | null
    alignment?: string | null
  } | null
  deliveryProcess?: Array<{
    id?: number | string
    stepLabel?: string | null
    stepNumber?: string | null
    title?: string | null
    description?: string | null
    sortOrder?: number | string | null
    order?: number | string | null
    attributes?: {
      stepLabel?: string | null
      stepNumber?: string | null
      title?: string | null
      description?: string | null
      sortOrder?: number | string | null
      order?: number | string | null
    } | null
  }> | null
  connectedSolutions?: {
    eyebrow?: string | null
    title?: string | null
    description?: string | null
    centerLabel?: string | null
    points?: Array<{
      id?: number | string
      iconKey?: string | { iconKey?: string | null } | null
      title?: string | null
      description?: string | null
      order?: number | string | null
      attributes?: {
        iconKey?: string | { iconKey?: string | null } | null
        title?: string | null
        description?: string | null
        order?: number | string | null
      } | null
    }> | null
    orbitItems?: Array<{
      id?: number | string
      label?: string | null
      features?: string | null
      order?: number | string | null
      attributes?: {
        label?: string | null
        features?: string | null
        order?: number | string | null
      } | null
    }> | null
  } | null
  valueCardsSection?: {
    label?: string | null
    title?: string | null
    highlightText?: string | null
    subtitle?: string | null
    alignment?: string | null
  } | null
  valueSection?: {
    label?: string | null
    title?: string | null
    highlightText?: string | null
    subtitle?: string | null
    alignment?: string | null
  } | null
  benefitsSectionHeading?: {
    label?: string | null
    title?: string | null
    highlightText?: string | null
    subtitle?: string | null
    alignment?: string | null
  } | null
  valueCards?: Array<{
    id?: number | string
    title?: string | null
    description?: string | null
    iconKey?: string | { iconKey?: string | null } | null
    order?: number | string | null
    attributes?: {
      title?: string | null
      description?: string | null
      iconKey?: string | { iconKey?: string | null } | null
      order?: number | string | null
    } | null
  }> | null
  benefits?: Array<{
    id?: number | string
    title?: string | null
    description?: string | null
    iconKey?: string | { iconKey?: string | null } | null
    order?: number | string | null
    attributes?: {
      title?: string | null
      description?: string | null
      iconKey?: string | { iconKey?: string | null } | null
      order?: number | string | null
    } | null
  }> | null
  partnershipStagesSection?: {
    label?: string | null
    title?: string | null
    highlightText?: string | null
    subtitle?: string | null
    alignment?: string | null
  } | null
  partnershipStages?: Array<{
    id?: number | string
    title?: string | null
    description?: string | null
    iconKey?: string | { iconKey?: string | null } | null
    bullets?: unknown
    checklist?: unknown
    features?: unknown
    items?: unknown
    cta?: StrapiServicesHeroButton | string | null
    button?: StrapiServicesHeroButton | string | null
    partnershipStageBtn?: StrapiServicesHeroButton | string | null
    featured?: boolean | null
    isFeatured?: boolean | null
    isRecommended?: boolean | null
    sortOrder?: number | string | null
    order?: number | string | null
    attributes?: {
      title?: string | null
      description?: string | null
      iconKey?: string | { iconKey?: string | null } | null
      bullets?: unknown
      checklist?: unknown
      features?: unknown
      items?: unknown
      cta?: StrapiServicesHeroButton | string | null
      button?: StrapiServicesHeroButton | string | null
      partnershipStageBtn?: StrapiServicesHeroButton | string | null
      featured?: boolean | null
      isFeatured?: boolean | null
      isRecommended?: boolean | null
      sortOrder?: number | string | null
      order?: number | string | null
    } | null
  }> | null
  faqSection?: {
    label?: string | null
    title?: string | null
    highlightText?: string | null
    subtitle?: string | null
    alignment?: string | null
  } | null
  faqHeading?: {
    label?: string | null
    title?: string | null
    highlightText?: string | null
    subtitle?: string | null
    alignment?: string | null
  } | null
  faqs?: Array<{
    id?: number | string
    question?: string | null
    answer?: string | null
    order?: number | string | null
    sortOrder?: number | string | null
    attributes?: {
      question?: string | null
      answer?: string | null
      order?: number | string | null
      sortOrder?: number | string | null
    } | null
  }> | null
  seo?: StrapiServicesSeo | null
  finalCta?: StrapiServicesFinalCta | null
  cta?: StrapiServicesFinalCta | null
  finalCTA?: StrapiServicesFinalCta | null
  servicesCta?: StrapiServicesFinalCta | null
  heroFloatingCard?: StrapiServicesHeroCard[] | null
  heroFloatingCards?: StrapiServicesHeroCard[] | null
  attributes?: StrapiServicesPageData | null
}

export interface StrapiServicesPageResponse {
  data?: StrapiServicesPageData | null
}

export interface StrapiServiceItem {
  id?: number | string
  title?: string | null
  slug?: string | null
  shortDescription?: string | null
  description?: string | null
  showcaseEyebrow?: string | null
  showcaseTitle?: string | null
  showcaseDescription?: string | null
  showcaseFeatures?: unknown
  showcaseButton?: string | {
    label?: string | null
    text?: string | null
    url?: string | null
    href?: string | null
    newTab?: boolean | null
    openNewTab?: boolean | null
    newWindow?: boolean | null
  } | null
  serviceCategory?: string | { name?: string | null, title?: string | null, label?: string | null } | null
  iconKey?: string | { iconKey?: string | null } | null
  featuredImage?: StrapiMedia | string | null
  order?: number | string | null
  isFeatured?: boolean | null
  ctaLink?: string | null
  cardActionButtonText?: string | null
  attributes?: StrapiServiceItem | null
}

export interface StrapiServicesCollectionResponse {
  data?: StrapiServiceItem[] | null
}

export interface ServicesPageData {
  hero: {
    eyebrowText: string
    title: string
    highlightText: string
    description: string
    heroImage: string
    backgroundImage: string
    primaryButtonText: string
    primaryButtonUrl: string
    primaryButtonNewTab: boolean
    secondaryButtonText: string
    secondaryButtonUrl: string
    secondaryButtonNewTab: boolean
    alignment: string
    variant: string
  }
  heroFloatingCards: Array<{
    id: string
    title: string
    value: string
    description: string
    cardType: string
    iconKey: string
    order: number
  }>
  servicesSection: {
    label: string
    title: string
    highlightText: string
    subtitle: string
    alignment: string
  }
  featuredServicesSection: {
    label: string
    title: string
    highlightText: string
    subtitle: string
    alignment: string
  }
  deliveryProcessSection: {
    label: string
    title: string
    highlightText: string
    subtitle: string
    alignment: string
  }
  deliveryProcess: Array<{
    id: string
    stepLabel: string
    title: string
    description: string
    sortOrder?: number
  }>
  connectedSolutions: {
    eyebrow: string
    title: string
    description: string
    centerLabel: string
    points: Array<{
      id: string
      iconKey: string
      title: string
      description: string
      order?: number
    }>
    orbitItems: Array<{
      id: string
      label: string
      order?: number
    }>
  } | null
  valueCardsSection: {
    label: string
    title: string
    highlightText: string
    subtitle: string
    alignment: string
  }
  valueCards: Array<{
    id: string
    title: string
    description: string
    iconKey: string
    order?: number
  }>
  partnershipStagesSection: {
    label: string
    title: string
    highlightText: string
    subtitle: string
    alignment: string
  }
  partnershipStages: Array<{
    id: string
    title: string
    description: string
    iconKey: string
    bullets: string[]
    ctaLabel: string
    ctaUrl: string
    ctaNewTab: boolean
    featured: boolean
    order?: number
  }>
  faqSection: {
    label: string
    title: string
    highlightText: string
    subtitle: string
    alignment: string
  }
  faqs: Array<{
    id: string
    question: string
    answer: string
    order?: number
  }>
  serviceCards: Array<{
    id: string
    title: string
    slug: string
    showcaseEyebrow: string
    showcaseTitle: string
    showcaseDescription: string
    showcaseFeatures: string[]
    showcaseButtonLabel: string
    showcaseButtonUrl: string
    showcaseButtonNewTab: boolean
    shortDescription: string
    iconKey: string
    featuredImage: string
    order?: number
    isFeatured?: boolean
    ctaLink: string
    cardActionButtonText: string
    description: unknown
    serviceCategory: string
  }>
  seo: {
    metaTitle: string
    metaDescription: string
    metaImage: string
    canonicalPath: string
    noindex?: boolean
    nofollow?: boolean
  }
  finalCta: {
    title: string
    description: string
    primaryButton: {
      label: string
      url: string
      newTab: boolean
    }
    secondaryButton: {
      label: string
      url: string
      newTab: boolean
    }
    backgroundImage: string
    variant: string
  }
  ctaSection: {
    isEnabled: boolean
    eyebrow: string
    title: string
    description: string
    primaryButton: {
      label: string
      url: string
      newTab: boolean
    }
    secondaryButton: {
      label: string
      url: string
      newTab: boolean
    }
    backgroundImage: string
    variant: string
  } | null
}
