<script setup lang="ts">
import type { HomepageData } from '~/types/homepage'

type ServicesHeading = HomepageData['servicesHeading']
type FeaturedService = HomepageData['featuredServices'][number]

const props = withDefaults(defineProps<{
  heading?: ServicesHeading
  services?: FeaturedService[]
}>(), {
  heading: () => ({
    label: '',
    title: '',
    subtitle: '',
    highlightText: '',
    alignment: ''
  }),
  services: () => []
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

const sortedServices = computed(() => {
  return [...(props.services || [])].sort((a, b) => a.order - b.order)
})

const hasServices = computed(() => sortedServices.value.length > 0)

const serviceHref = (service: FeaturedService) => {
  if (service.slug) return `/services/${service.slug}`
  if (service.url) return service.url
  return '#'
}

const cardDelay = (index: number) => {
  return `${Math.min(index * 100, 600)}ms`
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!import.meta.client) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isVisible.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        isVisible.value = true
        observer?.disconnect()
      }
    },
    { threshold: 0.35, rootMargin: '0px 0px -12% 0px' }
  )

  if (sectionRef.value) observer.observe(sectionRef.value)
})

onBeforeUnmount(() => { observer?.disconnect() })
</script>

<template>
  <div
    v-if="hasServices"
    ref="sectionRef"
    aria-labelledby="services-section-title"
  >
    <SectionHeading
      id="services-section-title"
      :heading="heading"
      :visible="true"
      max-width="max-w-[42rem]"
    />

    <div class="mx-auto grid max-w-[76rem] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="(service, i) in sortedServices"
        :key="service.id"
        :to="serviceHref(service)"
        class="service-card-reveal service-card flex flex-col rounded-[1.5rem] border p-8 no-underline shadow-sm"
        :class="[
          isVisible ? 'is-visible' : '',
          'featured-card border-slate-200 bg-slate-50'
        ]"
        :style="{ '--delay': cardDelay(i) }"
        :aria-label="`Learn more about ${service.title}`"
      >
        <span
          class="card-icon-wrap mb-5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[#006c4f]"
          style="background-color: #d8f8ea;"
          aria-hidden="true"
        >
          <AppIcon
            :icon-key="service.iconKey"
            :title="service.title"
            class="h-6 w-6"
          />
        </span>

        <h3 class="card-title mb-3 text-xl font-bold leading-snug text-[#001c2a]">
          {{ service.title }}
        </h3>

        <p class="card-description mb-6 flex-1 text-[0.9375rem] leading-relaxed text-slate-600">
          {{ service.shortDescription || service.description }}
        </p>

        <span class="card-link inline-flex items-center gap-1.5 text-sm font-semibold text-[#006c4f]">
          Learn More
          <svg
            class="card-arrow h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.service-card-reveal {
  opacity: 0;
  transform: translateY(24px);
}

.service-card-reveal.is-visible {
  animation: serviceFadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0ms) both;
}

.service-card {
  will-change: transform, opacity;
}

.featured-card {
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.3s ease,
    background-color 0.3s ease,
    color 0.3s ease;
}

.featured-card:hover {
  transform: translateY(-0.4rem);
  box-shadow: 0 24px 60px rgba(0, 28, 42, 0.22);
  border-color: #00374f;
  background-color: #001c2a;
}

.featured-card:hover .card-title,
.featured-card:hover .card-description {
  color: rgba(255, 255, 255, 0.92);
}

.featured-card:hover .card-link {
  color: #67fcc6;
}

.featured-card:hover .card-icon-wrap {
  background-color: rgba(103, 252, 198, 0.18) !important;
  color: #67fcc6;
}

.card-icon-wrap {
  transition: transform 0.28s ease;
}

.card-arrow {
  transition: transform 0.25s ease;
}

.service-card:hover .card-arrow {
  transform: translateX(0.3rem);
}

.service-card:hover .card-icon-wrap {
  transform: scale(1.04) translateY(-0.05rem);
}

@keyframes serviceFadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .service-card-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .featured-card,
  .card-icon-wrap,
  .card-arrow {
    transition: none;
  }

  .service-card:hover .card-arrow,
  .service-card:hover .card-icon-wrap,
  .featured-card:hover {
    transform: none;
  }
}
</style>
