export interface StrapiAboutSeo {
  metaTitle?: string | null
  metaDescription?: string | null
  metaImage?: string | { url?: string | null } | null
  canonicalPath?: string | null
  noindex?: boolean | null
  nofollow?: boolean | null
}

export interface StrapiAboutHero {
  eyebrowText?: string | null
  title?: string | null
  highlightText?: string | null
  description?: string | null
  heroImage?: string | null
  backgroundImage?: string | null
  primaryButton?: {
    text?: string | null
    label?: string | null
    url?: string | null
    href?: string | null
    newTab?: boolean | null
  } | null
  secondaryButton?: {
    text?: string | null
    label?: string | null
    url?: string | null
    href?: string | null
    newTab?: boolean | null
  } | null
  primaryButtonText?: string | null
  primaryButtonUrl?: string | null
  secondaryButtonText?: string | null
  secondaryButtonUrl?: string | null
  alignment?: string | null
  variant?: string | null
  [key: string]: unknown
}

export interface AboutHeroCard {
  id: string
  title: string
  value: string
  description: string
  iconKey: string
  cardType: string
  order: number
}

export interface AboutSectionHeading {
  label: string
  title: string
  highlightText: string
  subtitle: string
  alignment: string
}

export interface AboutStoryParagraph {
  content: string
  order: number
}

export interface AboutCompetency {
  label: string
  iconKey: string
  order: number
}

export interface AboutMissionVisionCard {
  id: string
  title: string
  description: string
  iconKey: string
  order: number
}

export interface AboutValueItem {
  id: string
  title: string
  description: string
  iconKey: string
  order: number
}

export interface AboutPillarItem {
  id: string
  title: string
  description: string
  iconKey: string
  image: string
  link: string
  variant: string
  order: number
}

export interface AboutEdgeItem {
  id: string
  title: string
  description: string
  iconKey: string
  order: number
}

export interface AboutApproachStep {
  id: string
  stepNumber: string
  title: string
  description: string
  iconKey: string
  order: number
}

export interface AboutExpertItem {
  id: string
  title: string
  role: string
  description: string
  image: unknown
  iconKey: string
  order: number
}

export interface AboutFinalCtaButton {
  label: string
  url: string
  newTab: boolean
  openNewTab: boolean
}

export interface AboutFinalCta {
  title: string
  description: string
  button: AboutFinalCtaButton
  backgroundImage: string
  variant: string
}

export interface StrapiAboutData {
  seo?: StrapiAboutSeo | null
  hero?: StrapiAboutHero | null
  heroCards?: unknown[] | null
  storyHeading?: unknown
  storyParagraphs?: unknown[] | null
  competenciesTitle?: string | null
  competencies?: unknown[] | null
  missionVisionCards?: unknown[] | null
  valuesHeading?: unknown
  values?: unknown[] | null
  pillarsHeading?: unknown
  pillars?: unknown[] | null
  edgeHeading?: unknown
  edgeItems?: unknown[] | null
  edgeImage?: unknown
  showHeroImage?: boolean | null
  approachHeading?: unknown
  approachSteps?: unknown[] | null
  expertsHeading?: unknown
  experts?: unknown[] | null
  finalCta?: unknown
  attributes?: StrapiAboutData | null
  [key: string]: unknown
}

export interface StrapiAboutResponse {
  data?: StrapiAboutData | null
}

export interface AboutData {
  seo: {
    metaTitle: string
    metaDescription: string
    metaImage: string
    canonicalPath: string
    noindex?: boolean
    nofollow?: boolean
  }
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
  heroCards: AboutHeroCard[]
  storyHeading: AboutSectionHeading
  storyParagraphs: AboutStoryParagraph[]
  competenciesTitle: string
  competencies: AboutCompetency[]
  missionVisionCards: AboutMissionVisionCard[]
  valuesHeading: AboutSectionHeading
  values: AboutValueItem[]
  pillarsHeading: AboutSectionHeading
  pillars: AboutPillarItem[]
  edgeHeading: AboutSectionHeading
  edgeItems: AboutEdgeItem[]
  edgeImage: string
  showHeroImage: boolean
  approachHeading: AboutSectionHeading
  approachSteps: AboutApproachStep[]
  expertsHeading: AboutSectionHeading
  experts: AboutExpertItem[]
  finalCta: AboutFinalCta
}
