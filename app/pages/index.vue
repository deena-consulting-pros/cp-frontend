<script setup lang="ts">
import { buildOrganizationSchema, buildWebPageSchema, buildWebsiteSchema, normalizeAbsoluteUrl, sanitizeSchemaUrl } from '~/utils/schema'

const defaults = useSeoDefaults()
const { resolveImageUrl } = useStrapi()
const { homepage, pending, error } = await useHomepage()

const siteUrl = normalizeAbsoluteUrl(defaults.siteUrl) || 'http://localhost:3000'
const siteName = defaults.siteName || 'Consulting Pros'
const homepageData = computed(() => homepage.value)

const hasHomepageContent = computed(() => Boolean(
  homepageData.value.hero.title
  || homepageData.value.hero.description
  || homepageData.value.hero.heroImage
))

const pageTitle = homepageData.value.seo.metaTitle
  || defaults.defaultSeo.metaTitle
  || homepageData.value.hero.title
  || `${siteName}${defaults.siteSlogan ? ` | ${defaults.siteSlogan}` : ''}`
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
    alt: homepageData.value.hero.title || siteName
  }
})

const logoUrl = sanitizeSchemaUrl(resolveImageUrl(defaults.siteLogo, siteUrl), siteUrl)
const sameAs = defaults.siteSameAs
  .map((url) => sanitizeSchemaUrl(url, siteUrl, { allowExternal: true }))
  .filter(Boolean)
const searchUrl = normalizeAbsoluteUrl(defaults.siteSearchUrl)

const organizationSchema = buildOrganizationSchema({
  siteUrl,
  name: siteName,
  logo: logoUrl || undefined,
  description: defaults.siteDescription || undefined,
  slogan: defaults.siteSlogan || undefined,
  sameAs,
  supportEmail: defaults.supportEmail || undefined,
  supportPhone: defaults.supportPhone || undefined,
  address: {
    streetAddress: defaults.businessStreetAddress || undefined,
    addressLocality: defaults.businessAddressLocality || undefined,
    addressRegion: defaults.businessAddressRegion || undefined,
    postalCode: defaults.businessPostalCode || undefined,
    addressCountry: defaults.businessAddressCountry || undefined
  }
})

const websiteSchema = buildWebsiteSchema({
  siteUrl,
  name: siteName,
  description: defaults.siteDescription || undefined,
  searchUrl: searchUrl.includes('{search_term_string}') ? searchUrl : undefined,
  navigation: [
    {
      name: 'Home',
      url: siteUrl
    }
  ]
})

const webPageSchema = buildWebPageSchema({
  canonicalUrl,
  siteUrl,
  id: `${siteUrl}/#webpage`,
  name: pageTitle,
  description: pageDescription,
  inLanguage: defaults.siteLanguage || 'en',
  primaryImageOfPage: sanitizeSchemaUrl(resolveImageUrl(pageImage, siteUrl), siteUrl) || logoUrl || undefined
})

useJsonLd([organizationSchema, websiteSchema, webPageSchema])
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
        <h1 class="text-2xl font-semibold text-slate-900">{{ siteName }}</h1>
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
        <SectionShell background="white" container="normal" section-class="overflow-x-clip py-24 lg:py-28" container-class="lg:px-10">
          <PortfolioSection
            :heading="homepageData.portfolioHeading"
            :items="homepageData.portfolioItems"
            :button="homepageData.portfolioButton"
          />
        </SectionShell>
        <SectionShell background="light" container="normal" section-class="overflow-x-clip py-20 md:py-24 lg:py-28" container-class="lg:px-10">
          <TestimonialsSection
            :heading="homepageData.testimonialsHeading"
            :testimonials="homepageData.testimonials"
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
