<script setup lang="ts">
import { buildBreadcrumbSchema, buildOrganizationSchema, buildWebPageSchema, normalizeAbsoluteUrl, sanitizeSchemaUrl } from '~/utils/schema'

const defaults = useSeoDefaults()
const { resolveImageUrl } = useStrapi()
const { about, pending, error } = await useAbout()

const aboutData = computed(() => about.value)
const aboutHeroCards = computed(() => aboutData.value?.heroCards || [])
const siteUrl = normalizeAbsoluteUrl(defaults.siteUrl) || 'http://localhost:3000'
const siteName = defaults.siteName || 'Consulting Pros'

const pageTitle = aboutData.value.seo.metaTitle
  || defaults.defaultSeo.metaTitle
  || aboutData.value.hero.title
  || `About | ${siteName}`

const pageDescription = aboutData.value.seo.metaDescription
  || defaults.defaultSeo.metaDescription
  || defaults.siteDescription
  || ''

const canonicalPath = aboutData.value.seo.canonicalPath
  || '/about'

const pageImage = aboutData.value.seo.metaImage
  || defaults.defaultOgImage
  || defaults.defaultSeo.metaImage
  || defaults.siteLogo

const { canonicalUrl } = usePageMeta({
  pageType: 'page',
  title: pageTitle,
  description: pageDescription,
  canonicalPath,
  noindex: aboutData.value.seo.noindex ?? defaults.defaultSeo.noindex,
  nofollow: aboutData.value.seo.nofollow ?? defaults.defaultSeo.nofollow,
  image: {
    url: pageImage,
    alt: aboutData.value.hero.title || `${siteName} About`
  }
})

const logoUrl = sanitizeSchemaUrl(resolveImageUrl(defaults.siteLogo, siteUrl), siteUrl)
const sameAs = defaults.siteSameAs
  .map((url) => sanitizeSchemaUrl(url, siteUrl, { allowExternal: true }))
  .filter(Boolean)
const breadcrumbId = `${siteUrl}/about#breadcrumb`

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

const aboutPageSchema = buildWebPageSchema({
  canonicalUrl,
  siteUrl,
  type: 'AboutPage',
  id: `${siteUrl}/about#webpage`,
  name: pageTitle,
  description: pageDescription,
  inLanguage: defaults.siteLanguage || 'en',
  primaryImageOfPage: sanitizeSchemaUrl(resolveImageUrl(pageImage, siteUrl), siteUrl) || logoUrl || undefined,
  breadcrumbId
})

const breadcrumbSchema = buildBreadcrumbSchema({
  id: breadcrumbId,
  items: [
    { name: 'Home', url: siteUrl },
    { name: 'About', url: `${siteUrl}/about` }
  ]
})

useJsonLd([organizationSchema, aboutPageSchema, breadcrumbSchema])
</script>

<template>
  <main class="min-h-screen bg-[#f0f4f8] text-slate-900">
    <div class="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8" v-if="pending || error">
      <p
        v-if="pending"
        class="text-sm text-slate-600"
        role="status"
        aria-live="polite"
      >
        Loading About page content...
      </p>
      <p
        v-else-if="error"
        class="text-sm text-red-700"
        role="alert"
      >
        Unable to load About page. Please try again later.
      </p>
    </div>

    <AboutHeroSection
      v-else
      :hero="aboutData.hero"
      :cards="aboutHeroCards"
    />

    <SectionShell
      v-if="!pending && !error"
      background="white"
      container="normal"
      section-class="py-16 md:py-20 lg:py-24"
      container-class="lg:px-10"
    >
      <AboutStorySection
        :heading="aboutData.storyHeading"
        :paragraphs="aboutData.storyParagraphs"
        :competencies-title="aboutData.competenciesTitle"
        :competencies="aboutData.competencies"
      />
    </SectionShell>

    <SectionShell
      v-if="!pending && !error && aboutData.missionVisionCards?.length"
      background="light"
      container="normal"
      section-class="py-16 md:py-20 lg:py-24"
      container-class="lg:px-10"
    >
      <MissionVisionSection :cards="aboutData.missionVisionCards" />
    </SectionShell>

    <SectionShell
      v-if="!pending && !error && aboutData.values?.length"
      background="light"
      container="normal"
      section-class="py-16 md:py-20 lg:py-24"
      container-class="lg:px-10"
    >
      <AboutValuesSection
        :heading="aboutData.valuesHeading"
        :values="aboutData.values"
      />
    </SectionShell>

    <SectionShell
      v-if="!pending && !error && aboutData.pillars?.length"
      background="light"
      container="normal"
      section-class="py-16 md:py-20 lg:py-24"
      container-class="lg:px-10"
    >
      <CorePillarsSection
        :heading="aboutData.pillarsHeading"
        :pillars="aboutData.pillars"
      />
    </SectionShell>

    <SectionShell
      v-if="!pending && !error && (aboutData.edgeItems?.length || aboutData.edgeHeading?.title || aboutData.edgeImage)"
      background="transparent"
      container="full"
      no-padding-top
      no-padding-bottom
      container-class="!px-0 sm:!px-0 lg:!px-0"
    >
      <AboutEdgeSection
        :heading="aboutData.edgeHeading"
        :items="aboutData.edgeItems"
        :image="aboutData.edgeImage"
      />
    </SectionShell>

    <SectionShell
      v-if="!pending && !error && aboutData.approachSteps?.length"
      background="light"
      container="normal"
      section-class="py-16 md:py-20 lg:py-24"
      container-class="lg:px-10"
    >
      <AboutApproachSection
        :heading="aboutData.approachHeading"
        :steps="aboutData.approachSteps"
      />
    </SectionShell>

    <SectionShell
      v-if="!pending && !error && aboutData.experts?.length"
      background="light"
      container="normal"
      section-class="py-16 md:py-20 lg:py-24"
      container-class="lg:px-10"
    >
      <ExpertsSection
        :heading="aboutData.expertsHeading"
        :experts="aboutData.experts"
      />
    </SectionShell>

    <SectionShell
      v-if="!pending && !error && (aboutData.finalCta?.title || aboutData.finalCta?.description || aboutData.finalCta?.button?.label)"
      background="light"
      container="normal"
      section-class="overflow-x-clip py-20 md:py-24 lg:py-28"
      container-class="lg:px-10"
    >
      <CtaSection :cta="aboutData.finalCta" />
    </SectionShell>
  </main>
</template>
