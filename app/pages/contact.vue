<script setup lang="ts">
import { buildBreadcrumbSchema, buildOrganizationSchema, buildWebPageSchema, normalizeAbsoluteUrl, sanitizeSchemaUrl } from '~/utils/schema'

const defaults = useSeoDefaults()
const { resolveImageUrl } = useStrapi()
const { contact, pending, error } = await useContact()
const heroRef = ref<HTMLElement | null>(null)
const formRef = ref<HTMLElement | null>(null)
const stepsRef = ref<HTMLElement | null>(null)
const faqRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)

const heroVisible = ref(false)
const formVisible = ref(false)
const stepsVisible = ref(false)
const faqVisible = ref(false)
const ctaVisible = ref(false)

let sectionObserver: IntersectionObserver | null = null

const contactData = computed(() => contact.value)
const siteUrl = normalizeAbsoluteUrl(defaults.siteUrl) || 'http://localhost:3000'
const siteName = defaults.siteName || 'Consulting Pros'
const contactUrl = `${siteUrl}/contact`

const pageTitle = contactData.value.seo.metaTitle
  || defaults.defaultSeo.metaTitle
  || contactData.value.hero.title
  || `Contact Us | ${siteName}`

const pageDescription = contactData.value.seo.metaDescription
  || defaults.defaultSeo.metaDescription
  || contactData.value.hero.description
  || defaults.siteDescription
  || ''

const canonicalPath = contactData.value.seo.canonicalPath || '/contact'

const { canonicalUrl } = usePageMeta({
  pageType: 'page',
  title: pageTitle,
  description: pageDescription,
  canonicalPath,
  noindex: contactData.value.seo.noindex ?? defaults.defaultSeo.noindex,
  nofollow: contactData.value.seo.nofollow ?? defaults.defaultSeo.nofollow,
  image: {
    url: contactData.value.seo.metaImage,
    alt: contactData.value.hero.title || `${siteName} contact`
  }
})

const logoUrl = sanitizeSchemaUrl(resolveImageUrl(defaults.siteLogo, siteUrl), siteUrl)
const sameAs = defaults.siteSameAs
  .map((url) => sanitizeSchemaUrl(url, siteUrl, { allowExternal: true }))
  .filter(Boolean)
const breadcrumbId = `${contactUrl}#breadcrumb`
const contactCardEmail = contactData.value.contactInfoCards.find((card) => card.linkUrl.startsWith('mailto:'))?.linkUrl.replace(/^mailto:/i, '')
const contactCardPhone = contactData.value.contactInfoCards.find((card) => card.linkUrl.startsWith('tel:'))?.linkUrl.replace(/^tel:/i, '')
const supportEmail = defaults.supportEmail || contactCardEmail || undefined
const supportPhone = defaults.supportPhone || contactCardPhone || undefined
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
  supportEmail,
  supportPhone,
  address: {
    streetAddress: defaults.businessStreetAddress || undefined,
    addressLocality: defaults.businessAddressLocality || undefined,
    addressRegion: defaults.businessAddressRegion || undefined,
    postalCode: defaults.businessPostalCode || undefined,
    addressCountry: normalizedAddressCountry || undefined
  }
})
const organizationSchemaWithContactPoint = {
  ...organizationSchema,
  ...(supportEmail || supportPhone
    ? {
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          ...(supportEmail ? { email: supportEmail } : {}),
          ...(supportPhone ? { telephone: supportPhone } : {}),
          areaServed: 'AE',
          availableLanguage: 'English'
        }
      }
    : {})
}

const contactPageSchemaBase = buildWebPageSchema({
  canonicalUrl,
  siteUrl,
  type: 'ContactPage',
  id: `${contactUrl}#webpage`,
  name: pageTitle,
  description: pageDescription,
  inLanguage: defaults.siteLanguage || 'en',
  primaryImageOfPage: sanitizeSchemaUrl(resolveImageUrl(contactData.value.seo.metaImage, siteUrl), siteUrl) || logoUrl || undefined,
  breadcrumbId
})
const contactPageSchema = {
  ...contactPageSchemaBase,
  url: contactUrl,
  publisher: {
    '@id': `${siteUrl}/#organization`
  },
  mainEntity: {
    '@id': `${siteUrl}/#organization`
  }
}

const breadcrumbSchema = buildBreadcrumbSchema({
  id: breadcrumbId,
  items: [
    { name: 'Home', url: siteUrl },
    { name: 'Contact Us', url: contactUrl }
  ]
})

useJsonLd([organizationSchemaWithContactPoint, contactPageSchema, breadcrumbSchema])

onMounted(() => {
  const setAllVisible = () => {
    heroVisible.value = true
    formVisible.value = true
    stepsVisible.value = true
    faqVisible.value = true
    ctaVisible.value = true
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setAllVisible()
    return
  }

  const visibilityMap = new Map<HTMLElement, Ref<boolean>>()
  if (heroRef.value) visibilityMap.set(heroRef.value, heroVisible)
  if (formRef.value) visibilityMap.set(formRef.value, formVisible)
  if (stepsRef.value) visibilityMap.set(stepsRef.value, stepsVisible)
  if (faqRef.value) visibilityMap.set(faqRef.value, faqVisible)
  if (ctaRef.value) visibilityMap.set(ctaRef.value, ctaVisible)

  if (!visibilityMap.size) {
    setAllVisible()
    return
  }

  sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const state = visibilityMap.get(entry.target as HTMLElement)
      if (state) state.value = true
      sectionObserver?.unobserve(entry.target)
    })
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -8% 0px'
  })

  visibilityMap.forEach((_, element) => {
    sectionObserver?.observe(element)
  })
})

onBeforeUnmount(() => {
  sectionObserver?.disconnect()
  sectionObserver = null
})
</script>

<template>
  <main class="min-h-screen bg-[#f0f4f8] text-slate-900">
    <div class="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8" v-if="pending || error">
      <LoadingSpinner
        v-if="pending"
        label="Loading Contact page content..."
      />
      <div
        v-else-if="error"
        class="rounded-2xl border border-red-200 bg-red-50 p-5"
        role="alert"
      >
        <p class="text-sm text-red-700">We're having trouble loading this page. Please try again later.</p>
      </div>
    </div>

    <div
      v-if="!pending && !error"
      ref="heroRef"
      class="contact-reveal"
      :class="{ 'is-visible': heroVisible }"
    >
      <ContactHero
        :hero="contactData.hero"
        :hero-points="contactData.heroPoints"
        :show-hero-image="contactData.showHeroImage"
      />
    </div>

    <div
      v-if="!pending && !error"
      ref="formRef"
      class="contact-reveal"
      :class="{ 'is-visible': formVisible }"
    >
      <SectionShell
        id="contact-form"
        background="light"
        container="normal"
        section-class="bg-[#f3f3f5] py-16 md:py-20 lg:py-24"
        container-class="lg:px-10"
      >
        <ContactFormSection
          :heading="contactData.contactFormSection"
          :helper-text="contactData.helperText"
          :submit-button-label="contactData.submitButtonLabel"
          :service-options="contactData.serviceOptions"
          :contact-info-cards="contactData.contactInfoCards"
        />
      </SectionShell>
    </div>

    <div
      v-if="!pending && !error && contactData.nextSteps.length"
      ref="stepsRef"
      class="contact-reveal"
      :class="{ 'is-visible': stepsVisible }"
    >
      <SectionShell
        background="light"
        container="normal"
        section-class="bg-[#f3f3f5] py-16 md:py-20 lg:py-24"
        container-class="lg:px-10"
      >
        <ContactNextSteps
          :heading="contactData.nextStepsHeading"
          :steps="contactData.nextSteps"
        />
      </SectionShell>
    </div>

    <div
      v-if="!pending && !error && contactData.faqSection.length"
      ref="faqRef"
      class="contact-reveal"
      :class="{ 'is-visible': faqVisible }"
    >
      <SectionShell
        background="transparent"
        container="normal"
        section-class="bg-[#f3f3f5] pt-0 pb-16 md:pb-20 lg:pb-24"
        container-class="lg:px-10"
      >
        <ContactFaq
          :heading="contactData.faqHeading"
          :faqs="contactData.faqSection"
        />
      </SectionShell>
    </div>

    <div
      v-if="!pending && !error && (contactData.finalCta.title || contactData.finalCta.description || contactData.finalCta.button.label)"
      ref="ctaRef"
      class="contact-reveal"
      :class="{ 'is-visible': ctaVisible }"
    >
      <SectionShell
        background="light"
        container="normal"
        section-class="pt-0 pb-20 md:pb-24 lg:pb-28"
        container-class="lg:px-10"
      >
        <ContactFinalCta :cta="contactData.finalCta" />
      </SectionShell>
    </div>
  </main>
</template>

<style scoped>
.contact-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 600ms ease, transform 600ms ease;
}

.contact-reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .contact-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
