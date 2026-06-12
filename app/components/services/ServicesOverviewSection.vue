<script setup lang="ts">
import type { ServicesPageData } from '~/types/services'
import { resolveIconKey } from '~/utils/iconMap'

type ServicesOverviewHeading = ServicesPageData['servicesSection']
type ServiceCard = ServicesPageData['serviceCards'][number]

const props = withDefaults(defineProps<{
  heading?: ServicesOverviewHeading | null
  services?: ServiceCard[]
}>(), {
  heading: null,
  services: () => []
})

const hasCards = computed(() => (props.services?.length || 0) > 0)
const sortedServices = computed(() => {
  return [...(props.services || [])].sort((a, b) => (a?.order ?? Number.MAX_SAFE_INTEGER) - (b?.order ?? Number.MAX_SAFE_INTEGER))
})
const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const isExternalUrl = (url: string) => /^(https?:)?\/\//i.test(url) || url.startsWith('mailto:') || url.startsWith('tel:')
const isInternalUrl = (url: string) => Boolean(url) && !isExternalUrl(url)
const fallbackCta = '/services'
const defaultCtaLabel = 'Learn More'

const toIconKey = (value: unknown) => resolveIconKey(value)

const toCardCtaUrl = (service: ServiceCard) => {
  const slug = service?.slug?.trim()
  if (slug) return `/services/${slug}`
  if (service?.ctaLink?.trim()) return service.ctaLink
  return fallbackCta
}

onMounted(() => {
  if (!import.meta.client) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isVisible.value = true
    return
  }

  observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      isVisible.value = true
      observer?.disconnect()
    }
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' })

  if (sectionRef.value) observer.observe(sectionRef.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <SectionShell
    as="section"
    background="transparent"
    container="normal"
    section-class="bg-[#f3f3f5] py-16 md:py-20 lg:py-24"
    aria-labelledby="services-overview-title"
  >
    <div ref="sectionRef">
      <div class="services-heading-reveal" :class="{ 'is-visible': isVisible }">
        <SectionHeading
          id="services-overview-title"
          :heading="heading || undefined"
          :alignment="(heading?.alignment as 'left' | 'center' | 'right' | '') || ''"
          max-width="max-w-[46rem]"
          margin-bottom-class="mb-10 md:mb-12"
          :center-container="true"
        />
      </div>

      <div v-if="hasCards" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(service, index) in sortedServices"
          :key="service.id"
          class="service-overview-card flex h-full flex-col rounded-[1.6rem] border border-[#dbe5ec] bg-white p-7 shadow-[0_12px_28px_rgba(0,28,42,0.08)] md:p-8"
          :class="{ 'is-visible': isVisible }"
          :style="{ '--card-delay': `${index * 95}ms` }"
        >
          <span class="service-icon-badge mb-6 inline-flex h-14 w-14 shrink-0 self-start items-center justify-center rounded-full bg-[#d8f8ea] text-[#006c4f]" style="width:56px;height:56px;border-radius:999px;">
            <AppIcon :icon-key="toIconKey(service?.iconKey)" :title="service?.title" class="h-6 w-6" />
          </span>

          <h3 class="mb-3 text-[1.32rem] leading-tight font-bold text-[#001c2a]">
            {{ service?.title }}
          </h3>

          <p class="mb-7 flex-1 text-[0.98rem] leading-7 text-slate-600">
            {{ service?.shortDescription }}
          </p>

          <NuxtLink
            v-if="isInternalUrl(toCardCtaUrl(service))"
            :to="toCardCtaUrl(service)"
            class="inline-flex items-center gap-2 text-sm font-semibold text-[#006c4f] transition-transform duration-250 motion-reduce:transition-none"
            :aria-label="`${defaultCtaLabel} about ${service?.title || 'this service'}`"
          >
            {{ defaultCtaLabel }}
            <span aria-hidden="true" class="cta-arrow transition-transform duration-250 motion-reduce:transition-none">&rarr;</span>
          </NuxtLink>

          <a
            v-else
            :href="toCardCtaUrl(service)"
            class="inline-flex items-center gap-2 text-sm font-semibold text-[#006c4f] transition-transform duration-250 motion-reduce:transition-none"
            :aria-label="`${defaultCtaLabel} about ${service?.title || 'this service'}`"
          >
            {{ defaultCtaLabel }}
            <span aria-hidden="true" class="cta-arrow transition-transform duration-250 motion-reduce:transition-none">&rarr;</span>
          </a>
        </article>
      </div>
    </div>
  </SectionShell>
</template>

<style scoped>
.services-heading-reveal,
.service-overview-card {
  opacity: 0;
  transform: translateY(20px);
}

.services-heading-reveal.is-visible {
  animation: servicesFadeUp 0.72s ease-out both;
}

.service-overview-card.is-visible {
  animation: servicesFadeUp 0.72s ease-out var(--card-delay, 0ms) both;
}

.service-overview-card {
  transition: transform 0.24s ease, box-shadow 0.24s ease;
}

.service-overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 28, 42, 0.11);
}

.service-overview-card:hover .cta-arrow {
  transform: translateX(3px);
}

@keyframes servicesFadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .services-heading-reveal,
  .service-overview-card,
  .service-overview-card:hover {
    opacity: 1;
    transition: none;
    transform: none;
    animation: none !important;
  }

  .service-overview-card:hover .cta-arrow {
    transform: none;
  }
}
</style>
