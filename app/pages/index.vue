<script setup lang="ts">
import { buildFaqPageSchema, buildWebPageSchema, buildWebsiteSchema, normalizeAbsoluteUrl, sanitizeSchemaUrl } from '~/utils/schema'

const defaults = useSeoDefaults()
const { resolveImageUrl } = useStrapi()
const { organizationSchema, siteUrl } = useOrganizationSchema()
const { homepage, pending, error } = await useHomepage()

const homepageData = computed(() => homepage.value)

const hasHomepageContent = computed(() => Boolean(
  homepageData.value.hero.title
  || homepageData.value.hero.description
  || homepageData.value.hero.heroImage
))

const portfolioItems = computed(() => homepageData.value.portfolioItems || [])

const activePortfolioItems = computed(() =>
  [...portfolioItems.value]
    .filter((item) => item.title || item.shortDescription || item.thumbnail || item.featuredImage)
    .filter((item) => item.isActive !== false)
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
)

const hasPortfolioItems = computed(() => activePortfolioItems.value.length > 0)

const testimonials = computed(() => homepageData.value.testimonials || [])

const activeTestimonials = computed(() =>
  testimonials.value.filter((item) =>
    item &&
    item.quote &&
    item.clientName
  )
)

const hasTestimonials = computed(() => activeTestimonials.value.length > 0)

const pageTitle = homepageData.value.seo.metaTitle
  || defaults.defaultSeo.metaTitle
  || homepageData.value.hero.title
  || `${defaults.siteName || 'Consulting Pros'}${defaults.siteSlogan ? ` | ${defaults.siteSlogan}` : ''}`
const pageDescription = homepageData.value.seo.metaDescription
  || defaults.defaultSeo.metaDescription
  || homepageData.value.hero.description
  || defaults.siteDescription
  || ''
const canonicalPath = homepageData.value.seo.canonicalPath || defaults.defaultSeo.canonicalPath || '/'
const pageImage = homepageData.value.seo.metaImage
  || homepageData.value.hero.heroImage
  || defaults.defaultOgImage
  || defaults.defaultSeo.metaImage
  || defaults.siteLogo

const { canonicalUrl } = usePageMeta({
  pageType: 'home',
  title: pageTitle,
  description: pageDescription,
  canonicalPath,
  noindex: homepageData.value.seo.noindex ?? defaults.defaultSeo.noindex,
  nofollow: homepageData.value.seo.nofollow ?? defaults.defaultSeo.nofollow,
  image: {
    url: pageImage,
    alt: homepageData.value.hero.title || defaults.siteName || 'Consulting Pros'
  }
})

const searchUrl = normalizeAbsoluteUrl(defaults.siteSearchUrl)

const websiteSchema = buildWebsiteSchema({
  siteUrl: siteUrl.value,
  name: defaults.siteName || 'Consulting Pros',
  description: defaults.siteDescription || undefined,
  searchUrl: searchUrl.includes('{search_term_string}') ? searchUrl : undefined,
  navigation: [
    { name: 'Home', url: siteUrl.value },
    { name: 'About Us', url: `${siteUrl.value}/about` },
    { name: 'Services', url: `${siteUrl.value}/services` },
    { name: 'Contact Us', url: `${siteUrl.value}/contact` }
  ]
})

const webPageSchema = buildWebPageSchema({
  canonicalUrl,
  siteUrl: siteUrl.value,
  id: `${siteUrl.value}/#webpage`,
  name: pageTitle,
  description: pageDescription,
  inLanguage: defaults.siteLanguage || 'en',
  primaryImageOfPage: sanitizeSchemaUrl(resolveImageUrl(pageImage, siteUrl.value), siteUrl.value) || undefined
})

const faqPageSchema = computed(() => {
  if (!hasHomepageContent.value) {
    return null
  }

  const faqs = (homepageData.value.faqs || [])
    .filter((item) => item?.question?.trim() && item?.answer?.trim())

  if (!faqs.length) {
    return null
  }

  return buildFaqPageSchema({
    id: `${canonicalUrl}#faq`,
    mainEntity: faqs.map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim()
    }))
  })
})

useJsonLd(computed(() =>
  [
    organizationSchema.value,
    websiteSchema,
    webPageSchema,
    faqPageSchema.value
  ].filter((schema): schema is Record<string, unknown> => Boolean(schema))
))
</script>

<template>
  <main class="min-h-screen bg-[#f0f4f8] text-slate-900">
    <div class="mx-auto">
      <section
        v-if="pending"
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <LoadingSpinner label="Loading homepage content..." />
      </section>

      <section
        v-else-if="error"
        class="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm"
        role="alert"
      >
        <h1 class="text-2xl font-semibold text-red-700">Homepage content unavailable</h1>
        <p class="mt-2 text-sm text-red-700">
          We're having trouble loading the page. Please try again later.
        </p>
      </section>

      <section
        v-else-if="!hasHomepageContent"
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 class="text-2xl font-semibold text-slate-900">{{ defaults.siteName || 'Consulting Pros' }}</h1>
        <p class="mt-2 text-sm text-slate-600">
          We're updating our content. Please check back soon.
        </p>
      </section>

      <template v-else>
        <HeroSection :hero="homepageData.hero" :hero-cards="homepageData.heroFloatingCards" />
        <TrustedMarquee
          :heading="homepageData.trustedHeading"
          :logos="homepageData.trustedLogos"
        />
        <SectionShell background="white" container="normal" section-class="py-20 md:py-24" container-class="lg:px-10">
          <ServicesSection
            :heading="homepageData.servicesHeading"
            :services="homepageData.featuredServices"
          />
        </SectionShell>
        <SectionShell
          background="transparent"
          container="full"
          no-padding-top
          no-padding-bottom
          container-class="!px-0 sm:!px-0 lg:!px-0"
        >
          <WhyChooseSection
            :heading="homepageData.whyChooseHeading"
            :cards="homepageData.whyChooseCards"
            :image="homepageData.whyChooseImage"
            :background-image="homepageData.whyChooseBackgroundImage"
          />
        </SectionShell>
        <SectionShell background="light" container="normal" section-class="overflow-x-clip py-24 lg:py-28" container-class="lg:px-10">
          <ProcessSection
            :heading="homepageData.processHeading"
            :steps="homepageData.processSteps"
          />
        </SectionShell>
        <SectionShell
          v-if="hasPortfolioItems"
          background="white"
          container="normal"
          section-class="overflow-x-clip py-24 lg:py-28"
          container-class="lg:px-10"
        >
          <PortfolioSection
            :heading="homepageData.portfolioHeading"
            :items="activePortfolioItems"
            :button="homepageData.portfolioButton"
          />
        </SectionShell>
        <SectionShell
          v-if="hasTestimonials"
          background="light"
          container="normal"
          section-class="overflow-x-clip py-20 md:py-24 lg:py-28"
          container-class="lg:px-10"
        >
          <TestimonialsSection
            :heading="homepageData.testimonialsHeading"
            :testimonials="activeTestimonials"
          />
        </SectionShell>
        <SectionShell background="light" container="normal" section-class="overflow-x-clip py-20 md:py-24 lg:py-28" container-class="lg:px-10">
          <HomeFaqSection
            :heading="homepageData.faqHeading"
            :faqs="homepageData.faqs"
          />
        </SectionShell>
        <SectionShell background="white" container="normal" section-class="overflow-x-clip py-24 md:py-24 lg:py-28" container-class="lg:px-10">
          <CtaSection :cta="homepageData.finalCta" />
        </SectionShell>
      </template>
    </div>
  </main>
</template>
