<script setup lang="ts">
import { buildBreadcrumbSchema, buildOrganizationSchema, buildServicesSchema, buildWebPageSchema, normalizeAbsoluteUrl, sanitizeSchemaUrl } from '~/utils/schema'

const defaults = useSeoDefaults()
const { resolveImageUrl } = useStrapi()
const { services, pending, error } = await useServices()

const servicesData = computed(() => services.value)
const siteUrl = normalizeAbsoluteUrl(defaults.siteUrl) || 'http://localhost:3000'
const siteName = defaults.siteName || 'Consulting Pros'
const servicesUrl = `${siteUrl}/services`

const pageTitle = servicesData.value.seo.metaTitle
  || defaults.defaultSeo.metaTitle
  || servicesData.value.hero.title
  || `Services | ${siteName}`

const pageDescription = servicesData.value.seo.metaDescription
  || defaults.defaultSeo.metaDescription
  || servicesData.value.hero.description
  || defaults.siteDescription
  || ''

const canonicalPath = servicesData.value.seo.canonicalPath || '/services'
const pageImage = servicesData.value.seo.metaImage || servicesData.value.hero.heroImage

const { canonicalUrl } = usePageMeta({
  pageType: 'page',
  title: pageTitle,
  description: pageDescription,
  canonicalPath,
  noindex: servicesData.value.seo.noindex ?? defaults.defaultSeo.noindex,
  nofollow: servicesData.value.seo.nofollow ?? defaults.defaultSeo.nofollow,
  image: {
    url: pageImage,
    alt: servicesData.value.hero.title || `${siteName} services`
  }
})

const logoUrl = sanitizeSchemaUrl(resolveImageUrl(defaults.siteLogo, siteUrl), siteUrl)
const sameAs = defaults.siteSameAs
  .map((url) => sanitizeSchemaUrl(url, siteUrl, { allowExternal: true }))
  .filter(Boolean)
const breadcrumbId = `${servicesUrl}#breadcrumb`
const catalogId = `${servicesUrl}#services`

const countryCode = defaults.businessAddressCountry.trim().toUpperCase()
const normalizedAddressCountry = countryCode === 'AE'
  || countryCode === 'ARE'
  || countryCode === 'UNITED ARAB EMIRATES'
  || countryCode === 'UAE'
  ? 'AE'
  : (countryCode.length === 2 ? countryCode : '')

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
    addressCountry: normalizedAddressCountry || undefined
  }
})

const servicesPageSchemaBase = buildWebPageSchema({
  canonicalUrl,
  siteUrl,
  id: `${servicesUrl}#webpage`,
  name: pageTitle,
  description: pageDescription,
  inLanguage: defaults.siteLanguage || 'en',
  primaryImageOfPage: sanitizeSchemaUrl(resolveImageUrl(pageImage, siteUrl), siteUrl) || logoUrl || undefined,
  breadcrumbId
})
const servicesPageSchema = {
  ...servicesPageSchemaBase,
  url: servicesUrl,
  publisher: {
    '@id': `${siteUrl}/#organization`
  }
}

const breadcrumbSchema = buildBreadcrumbSchema({
  id: breadcrumbId,
  items: [
    { name: 'Home', url: siteUrl },
    { name: 'Services', url: servicesUrl }
  ]
})

const hasServiceDetailRoute = false
const catalogServiceItems = computed(() => (
  [...servicesData.value.serviceCards]
    .filter((item) => Boolean(item.title))
    .sort((a, b) => {
      const aOrder = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER
      const bOrder = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER
      return aOrder - bOrder
    })
    .map((item, index) => ({
      id: item.slug || item.id,
      name: item.title,
      description: item.shortDescription || undefined,
      position: index + 1,
      url: hasServiceDetailRoute && item.slug ? `${servicesUrl}/${item.slug}` : undefined
    }))
))

const servicesCatalogSchema = computed(() => buildServicesSchema({
  siteUrl,
  catalogId,
  name: servicesData.value.servicesSection.title || 'Services',
  description: servicesData.value.seo.metaDescription
    || servicesData.value.servicesSection.subtitle
    || pageDescription
    || undefined,
  serviceItems: catalogServiceItems.value
}))

const hasValueCardsSection = computed(() => {
  const heading = servicesData.value.valueCardsSection
  const hasHeading = Boolean(
    heading?.label?.trim()
    || heading?.title?.trim()
    || heading?.highlightText?.trim()
    || heading?.subtitle?.trim()
  )
  const hasCards = (servicesData.value.valueCards || []).length > 0
  return hasHeading || hasCards
})

useJsonLd(computed(() => [
  organizationSchema,
  servicesPageSchema,
  breadcrumbSchema,
  servicesCatalogSchema.value
]))
</script>

<template>
  <main class="min-h-screen bg-[#f0f4f8] text-slate-900">
    <div class="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8" v-if="pending || error">
      <LoadingSpinner
        v-if="pending"
        label="Loading Services page content..."
      />
      <div
        v-else-if="error"
        class="rounded-2xl border border-red-200 bg-red-50 p-5"
        role="alert"
      >
        <p class="text-sm text-red-700">We're having trouble loading this page. Please try again later.</p>
      </div>
    </div>

    <ServicesHeroSection
      v-else
      :hero="servicesData.hero"
      :cards="servicesData.heroFloatingCards"
    />

    <section id="services" v-if="!pending && !error">
      <ServicesOverviewSection
        :heading="servicesData.servicesSection"
        :services="servicesData.serviceCards"
      />
    </section>

    <ServicesCtaSection
      v-if="!pending && !error && servicesData.ctaSection"
      :cta="servicesData.ctaSection"
    />

    <SectionShell
      v-if="!pending && !error"
      background="light"
      container="wide"
      section-class="bg-[#f0f4f8] py-24 md:py-26 lg:py-28"
    >
      <FeaturedServicesSection
        :heading="servicesData.featuredServicesSection"
        :services="servicesData.serviceCards"
      />
    </SectionShell>

    <ConnectedSolutionsSection
      v-if="!pending && !error && servicesData.connectedSolutions"
      :section="servicesData.connectedSolutions"
    />

    <SectionShell
      v-if="!pending && !error"
      background="light"
      container="normal"
      section-class="py-16 md:py-20 lg:py-24"
      container-class="lg:px-10"
    >
      <ServicesDeliveryProcessSection
        :heading="servicesData.deliveryProcessSection"
        :steps="servicesData.deliveryProcess"
      />
    </SectionShell>

    <SectionShell
      v-if="!pending && !error && hasValueCardsSection"
      background="transparent"
      container="normal"
      section-class="bg-[#e8e8ea] py-16 md:py-20 lg:py-24"
      container-class="lg:px-10"
    >
      <ServicesValueCardsSection
        :heading="servicesData.valueCardsSection"
        :cards="servicesData.valueCards"
      />
    </SectionShell>

    <SectionShell
      v-if="!pending && !error"
      background="light"
      container="normal"
      section-class="py-16 md:py-20 lg:py-24"
      container-class="lg:px-10"
    >
      <ServicesPartnershipStagesSection
        :heading="servicesData.partnershipStagesSection"
        :stages="servicesData.partnershipStages"
      />
    </SectionShell>

    <SectionShell
      v-if="!pending && !error"
      background="transparent"
      container="normal"
      section-class="bg-[#f3f3f5] pt-0 pb-16 md:pb-20 lg:pb-24"
      container-class="lg:px-10"
    >
      <ServicesFaqSection
        :heading="servicesData.faqSection"
        :faqs="servicesData.faqs"
      />
    </SectionShell>

    <SectionShell
      v-if="!pending && !error"
      background="light"
      container="normal"
      section-class="pt-0 pb-20 md:pb-24 lg:pb-28"
      container-class="lg:px-10"
    >
      <ServicesFinalCtaSection :cta="servicesData.finalCta" />
    </SectionShell>
  </main>
</template>
