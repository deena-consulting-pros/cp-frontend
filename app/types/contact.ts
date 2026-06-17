export interface ContactSectionHeading {
  label: string
  title: string
  highlightText: string
  subtitle: string
  alignment: string
}

export interface ContactHeroPoint {
  id: string
  text: string
  iconKey: string
  order: number
}

export interface ContactServiceOption {
  id: string
  label: string
  value: string
  order: number
}

export interface ContactInfoCard {
  id: string
  title: string
  description: string
  linkLabel: string
  linkUrl: string
  iconKey: string
  order: number
}

export interface ContactNextStep {
  id: string
  title: string
  description: string
  iconKey: string
  order: number
}

export interface ContactFaqItem {
  id: string
  question: string
  answer: string
  order: number
}

export interface ContactFinalCta {
  title: string
  description: string
  button: {
    label: string
    url: string
    newTab: boolean
  }
}

export interface ContactPageData {
  seo: {
    metaTitle: string
    metaDescription: string
    metaImage: string
    canonicalPath: string
    noindex?: boolean
    nofollow?: boolean
  }
  showHeroImage: boolean
  hero: {
    eyebrowText: string
    title: string
    highlightText: string
    description: string
    heroImage: string
    primaryButtonText: string
    primaryButtonUrl: string
    primaryButtonNewTab: boolean
  }
  heroPoints: ContactHeroPoint[]
  contactFormSection: ContactSectionHeading
  submitButtonLabel: string
  helperText: string
  serviceOptions: ContactServiceOption[]
  contactInfoCards: ContactInfoCard[]
  nextStepsHeading: ContactSectionHeading
  nextSteps: ContactNextStep[]
  faqHeading: ContactSectionHeading
  faqSection: ContactFaqItem[]
  finalCta: ContactFinalCta
}

export interface StrapiContactPageData {
  seo?: unknown
  showHeroImage?: boolean | null
  hero?: unknown
  heroPoints?: unknown
  contactFormSection?: unknown
  serviceOptions?: unknown
  contactInfoCards?: unknown
  nextStepsHeading?: unknown
  nextSteps?: unknown
  faqHeading?: unknown
  faqSection?: unknown
  finalCta?: unknown
  attributes?: StrapiContactPageData | null
  [key: string]: unknown
}

export interface StrapiContactPageResponse {
  data?: StrapiContactPageData | null
}
