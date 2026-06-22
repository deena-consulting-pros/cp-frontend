import type { StrapiMedia } from '~/types/global'

export interface StrapiHomepageHero {
  title?: string | null
  eyebrowText?: string | null
  highlightText?: string | null
  description?: string | null
  heroImage?: StrapiMedia | string | null
  backgroundImage?: StrapiMedia | string | null
  primaryButton?: {
    text?: string | null
    label?: string | null
    url?: string | null
    href?: string | null
  } | null
  secondaryButton?: {
    text?: string | null
    label?: string | null
    url?: string | null
    href?: string | null
  } | null
  alignment?: string | null
  variant?: string | null
  subtitle?: string | null
  image?: StrapiMedia | string | null
  primaryButtonText?: string | null
  primaryButtonUrl?: string | null
  secondaryButtonText?: string | null
  secondaryButtonUrl?: string | null
  heroFloatingCard?: StrapiHeroFloatingCard[] | null
}

export interface StrapiHeroFloatingCard {
  id?: number | string
  title?: string | null
  value?: string | null
  description?: string | null
  iconKey?: string | null
  cardType?: string | null
  order?: number | null
  attributes?: StrapiHeroFloatingCard | null
}

export interface StrapiHomepageSeo {
  metaTitle?: string | null
  metaDescription?: string | null
  metaImage?: StrapiMedia | string | null
  canonicalPath?: string | null
  noindex?: boolean | null
  nofollow?: boolean | null
}

export interface StrapiServicesHeading {
  label?: string | null
  title?: string | null
  subtitle?: string | null
  highlightText?: string | null
  alignment?: string | null
}

export interface StrapiHomepageFeaturedService {
  id?: number | string
  title?: string | null
  description?: string | null
  shortDescription?: string | null
  slug?: string | null
  iconKey?: string | null
  featuredImage?: StrapiMedia | string | null
  url?: string | null
  buttonText?: string | null
  icon?: StrapiMedia | string | null
  order?: number | null
  isFeatured?: boolean | null
  attributes?: StrapiHomepageFeaturedService | null
  [key: string]: unknown
}

export interface StrapiWhyChooseHeading {
  label?: string | null
  title?: string | null
  subtitle?: string | null
  highlightText?: string | null
  alignment?: string | null
}

export interface StrapiProcessHeading {
  label?: string | null
  title?: string | null
  subtitle?: string | null
  highlightText?: string | null
  alignment?: string | null
}

export interface StrapiPortfolioHeading {
  label?: string | null
  title?: string | null
  subtitle?: string | null
  highlightText?: string | null
  alignment?: string | null
}

export interface StrapiTestimonialsHeading {
  label?: string | null
  title?: string | null
  subtitle?: string | null
  highlightText?: string | null
  alignment?: string | null
}

export interface StrapiTestimonial {
  id?: number | string
  quote?: string | null
  clientName?: string | null
  clientPosition?: string | null
  companyName?: string | null
  rating?: number | string | null
  clientImage?: StrapiMedia | string | null
  order?: number | null
  isActive?: boolean | null
  attributes?: StrapiTestimonial | null
}

export interface StrapiPortfolioButton {
  label?: string | null
  url?: string | null
  newTab?: boolean | null
}

export interface StrapiPortfolioItem {
  id?: number | string
  title?: string | null
  slug?: string | null
  category?: string | null
  shortDescription?: string | null
  thumbnail?: StrapiMedia | string | null
  featuredImage?: StrapiMedia | string | null
  projectUrl?: string | null
  buttonText?: string | null
  order?: number | null
  isActive?: boolean | null
  isFeatured?: boolean | null
  attributes?: StrapiPortfolioItem | null
}

export interface StrapiProcessStep {
  id?: number | string
  stepNumber?: string | number | null
  title?: string | null
  description?: string | null
  iconKey?: string | null
  order?: number | null
  attributes?: StrapiProcessStep | null
}

export interface StrapiWhyChooseCard {
  id?: number | string
  title?: string | null
  description?: string | null
  iconKey?: string | null
  order?: number | null
  attributes?: StrapiWhyChooseCard | null
}

export interface StrapiHomepageCta {
  title?: string | null
  description?: string | null
  buttonText?: string | null
  buttonUrl?: string | null
  secondaryButtonText?: string | null
  secondaryButtonUrl?: string | null
}

export interface StrapiHomepageFinalCta {
  title?: string | null
  description?: string | null
  button?: {
    label?: string | null
    url?: string | null
    newTab?: boolean | null
  } | null
  backgroundImage?: StrapiMedia | string | null
  variant?: string | null
}

export interface StrapiHomepageFaqHeading {
  label?: string | null
  title?: string | null
  subtitle?: string | null
  highlightText?: string | null
  alignment?: string | null
}

export interface StrapiHomepageFaqItem {
  id?: number | string
  question?: string | null
  answer?: string | null
  order?: number | null
  attributes?: StrapiHomepageFaqItem | null
}

export interface StrapiTrustedHeading {
  label?: string | null
  title?: string | null
  subtitle?: string | null
  highlightText?: string | null
  alignment?: string | null
}

export interface StrapiTrustedLogo {
  id?: number | string
  name?: string | null
  logo?: StrapiMedia | string | null
  url?: string | null
  order?: number | null
  isActive?: boolean | null
  attributes?: StrapiTrustedLogo | null
}

export interface StrapiHomepageData {
  hero?: StrapiHomepageHero | null
  heroFloatingCard?: StrapiHeroFloatingCard[] | null
  heroFloatingCards?: StrapiHeroFloatingCard[] | null
  introTitle?: string | null
  introDescription?: string | null
  servicesHeading?: StrapiServicesHeading | null
  featuredServices?: StrapiHomepageFeaturedService[] | null
  cta?: StrapiHomepageCta | null
  ctaTitle?: string | null
  ctaDescription?: string | null
  ctaButtonText?: string | null
  ctaButtonUrl?: string | null
  ctaSecondaryButtonText?: string | null
  ctaSecondaryButtonUrl?: string | null
  finalCta?: StrapiHomepageFinalCta | null
  trustedHeading?: StrapiTrustedHeading | null
  trustedLogos?: StrapiTrustedLogo[] | {
    data?: StrapiTrustedLogo[] | null
  } | null
  whyChooseHeading?: StrapiWhyChooseHeading | null
  whyChooseCards?: StrapiWhyChooseCard[] | null
  whyChooseImage?: StrapiMedia | string | null
  whyChooseBackgroundImage?: StrapiMedia | string | null
  processHeading?: StrapiProcessHeading | null
  processSteps?: StrapiProcessStep[] | null
  portfolioHeading?: StrapiPortfolioHeading | null
  portfolioButton?: StrapiPortfolioButton | null
  portfolioItems?: StrapiPortfolioItem[] | null
  testimonialsHeading?: StrapiTestimonialsHeading | null
  testimonials?: StrapiTestimonial[] | null
  faqHeading?: StrapiHomepageFaqHeading | null
  faqs?: StrapiHomepageFaqItem[] | null
  faqSection?: StrapiHomepageFaqItem[] | StrapiHomepageFaqHeading | null
  faqItems?: StrapiHomepageFaqItem[] | null
  frequentlyAskedQuestions?: StrapiHomepageFaqItem[] | null
  frequentlyAskedQuestionsHeading?: StrapiHomepageFaqHeading | null
  seo?: StrapiHomepageSeo | null
  attributes?: StrapiHomepageData | null
}

export interface StrapiHomepageResponse {
  data?: StrapiHomepageData | null
}

export interface HomepageFeaturedService {
  id: string
  title: string
  description: string
  shortDescription: string
  slug: string
  iconKey: string
  featuredImage: string
  url: string
  buttonText: string
  icon: string
  order: number
  isFeatured: boolean
}

export interface HomepageData {
  hero: {
    title: string
    eyebrowText: string
    highlightText: string
    description: string
    heroImage: string
    backgroundImage: string
    primaryButtonText: string
    primaryButtonUrl: string
    secondaryButtonText: string
    secondaryButtonUrl: string
    alignment: string
    variant: string
    subtitle: string
    image: string
  }
  heroFloatingCards: Array<{
    id: string
    title: string
    value: string
    description: string
    iconKey: string
    cardType: string
    order: number
  }>
  introTitle: string
  introDescription: string
  servicesHeading: {
    label: string
    title: string
    subtitle: string
    highlightText: string
    alignment: string
  }
  featuredServices: HomepageFeaturedService[]
  cta: {
    title: string
    description: string
    buttonText: string
    buttonUrl: string
    secondaryButtonText: string
    secondaryButtonUrl: string
  }
  finalCta: {
    title: string
    description: string
    button: {
      label: string
      url: string
      newTab: boolean
      openNewTab?: boolean
    }
    backgroundImage: string
    variant: string
  }
  trustedHeading: {
    label: string
    title: string
    subtitle: string
    highlightText: string
    alignment: string
  }
  trustedLogos: Array<{
    id: string
    name: string
    logo: string
    logoWidth: number
    logoHeight: number
    url: string
    order: number
    isActive: boolean
  }>
  whyChooseHeading: {
    label: string
    title: string
    subtitle: string
    highlightText: string
    alignment: string
  }
  whyChooseCards: Array<{
    id: string
    title: string
    description: string
    iconKey: string
    order: number
  }>
  whyChooseImage: {
    url: string
    alt: string
  }
  whyChooseBackgroundImage: {
    url: string
    alt: string
  }
  processHeading: {
    label: string
    title: string
    subtitle: string
    highlightText: string
    alignment: string
  }
  processSteps: Array<{
    id: string
    stepNumber: string
    title: string
    description: string
    iconKey: string
    order?: number
  }>
  portfolioHeading: {
    label: string
    title: string
    subtitle: string
    highlightText: string
    alignment: string
  }
  portfolioButton: {
    label: string
    url: string
    newTab: boolean
  }
  portfolioItems: Array<{
    id: string
    title: string
    slug: string
    category: string
    shortDescription: string
    thumbnail: string
    featuredImage: string
    projectUrl: string
    buttonText: string
    order?: number
    isActive?: boolean
    isFeatured?: boolean
  }>
  testimonialsHeading: {
    label: string
    title: string
    subtitle: string
    highlightText: string
    alignment: string
  }
  testimonials: Array<{
    id: string
    quote: string
    clientName: string
    clientPosition: string
    companyName: string
    rating: number
    clientImage: string
    order?: number
    isActive?: boolean
  }>
  faqHeading: {
    label: string
    title: string
    subtitle: string
    highlightText: string
    alignment: string
  }
  faqs: Array<{
    id: string
    question: string
    answer: string
    order?: number
  }>
  seo: {
    metaTitle: string
    metaDescription: string
    metaImage: string
    canonicalPath: string
    noindex?: boolean
    nofollow?: boolean
  }
}
