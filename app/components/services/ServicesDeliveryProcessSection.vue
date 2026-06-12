<script setup lang="ts">
import type { ServicesPageData } from '~/types/services'

type DeliveryHeading = ServicesPageData['deliveryProcessSection']
type DeliveryStep = ServicesPageData['deliveryProcess'][number]

const fallbackHeading: DeliveryHeading = {
  label: '',
  title: 'How We Deliver Your Services',
  highlightText: '',
  subtitle: '',
  alignment: 'center'
}

const fallbackSteps: DeliveryStep[] = [
  {
    id: 'services-delivery-fallback-1',
    stepLabel: '01',
    title: 'Discover',
    description: 'In-depth audit of your current digital landscape and competition.',
    sortOrder: 1
  },
  {
    id: 'services-delivery-fallback-2',
    stepLabel: '02',
    title: 'Plan',
    description: 'Custom roadmap aligned with your business KPIs and budget.',
    sortOrder: 2
  },
  {
    id: 'services-delivery-fallback-3',
    stepLabel: '03',
    title: 'Build',
    description: 'Deployment of optimized campaigns and web architectures.',
    sortOrder: 3
  },
  {
    id: 'services-delivery-fallback-4',
    stepLabel: '04',
    title: 'Improve',
    description: 'Ongoing measurement, A/B testing, and strategy refinement.',
    sortOrder: 4
  }
]

const props = withDefaults(defineProps<{
  heading?: DeliveryHeading | null
  steps?: DeliveryStep[]
}>(), {
  heading: () => ({
    label: '',
    title: 'How We Deliver Your Services',
    highlightText: '',
    subtitle: '',
    alignment: 'center'
  }),
  steps: () => []
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const normalizedHeading = computed<DeliveryHeading>(() => {
  const source = props.heading || fallbackHeading
  const title = source.title?.trim() || fallbackHeading.title
  return {
    label: source.label || '',
    title,
    highlightText: source.highlightText || '',
    subtitle: source.subtitle || '',
    alignment: source.alignment || 'center'
  }
})

const sortedSteps = computed<DeliveryStep[]>(() => {
  const source = (props.steps || [])
    .filter((step) => step?.title || step?.description)
    .map((step) => ({ ...step }))

  if (!source.length) return fallbackSteps

  return source.sort((a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER))
})

const hasContent = computed(() => sortedSteps.value.length > 0)

const formattedStepNumber = (stepLabel: string, index: number) => {
  const value = String(stepLabel || '').trim()
  if (value) return value
  return String(index + 1).padStart(2, '0')
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
  <section
    v-if="hasContent"
    ref="sectionRef"
    aria-labelledby="services-delivery-title"
  >
    <SectionHeading
      id="services-delivery-title"
      :heading="normalizedHeading"
      alignment="center"
      reveal-class="services-delivery-heading-reveal"
      :visible="isVisible"
      margin-bottom-class="mb-12 md:mb-14"
      max-width="max-w-[52rem]"
    />

    <div class="relative">
      <div
        class="pointer-events-none absolute left-[12.5%] right-[12.5%] top-12 z-0 hidden h-px bg-slate-200 lg:block"
        aria-hidden="true"
      />

      <ol class="relative z-10 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:grid-cols-4 lg:gap-8">
        <li
          v-for="(step, index) in sortedSteps"
          :key="step.id || `services-delivery-step-${index}`"
          class="services-delivery-step-reveal group flex flex-col items-center text-center"
          :class="{ 'is-visible': isVisible }"
          :style="{ '--services-delivery-delay': `${80 + (index * 100)}ms` }"
        >
          <span
            class="services-delivery-circle mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-white text-[1.5rem] font-bold leading-none text-[#001c2a] shadow-[0_10px_26px_rgba(15,23,42,0.08)] md:h-26 md:w-26"
          >
            {{ formattedStepNumber(step.stepLabel, index) }}
          </span>

          <h3 class="services-delivery-title max-w-[15rem] text-[1.12rem] font-semibold leading-[1.35] text-[#001c2a] md:text-[1.18rem]">
            {{ step.title }}
          </h3>

          <p v-if="step.description" class="mt-3 max-w-[16.5rem] text-[0.96rem] leading-7 text-slate-600">
            {{ step.description }}
          </p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.services-delivery-heading-reveal,
.services-delivery-step-reveal {
  opacity: 0;
  transform: translateY(20px);
}

.services-delivery-heading-reveal.is-visible {
  animation: servicesDeliveryFadeUp 0.7s ease-out both;
}

.services-delivery-step-reveal.is-visible {
  animation: servicesDeliveryFadeUp 0.72s ease-out var(--services-delivery-delay, 100ms) both;
}

.services-delivery-circle,
.services-delivery-title {
  transition: transform 0.28s ease, border-color 0.28s ease, color 0.28s ease, box-shadow 0.28s ease;
}

.services-delivery-step-reveal:hover .services-delivery-circle {
  transform: translateY(-3px);
  border-color: #27b38a;
  color: #006c4f;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
}

.services-delivery-step-reveal:hover .services-delivery-title {
  color: #006c4f;
}

@keyframes servicesDeliveryFadeUp {
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
  .services-delivery-heading-reveal,
  .services-delivery-step-reveal {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none;
  }

  .services-delivery-step-reveal:hover .services-delivery-circle {
    transform: none;
  }
}
</style>
