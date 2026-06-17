<script setup lang="ts">
import type { ServicesPageData } from '~/types/services'
import { resolveIconKey } from '~/utils/iconMap'

type ValueCardsHeading = ServicesPageData['valueCardsSection']
type ValueCard = ServicesPageData['valueCards'][number]

const emptyHeading: NonNullable<ValueCardsHeading> = {
  label: '',
  title: '',
  highlightText: '',
  subtitle: '',
  alignment: 'center'
}

const props = withDefaults(defineProps<{
  heading?: ValueCardsHeading | null
  cards?: ValueCard[]
}>(), {
  heading: () => ({
    label: '',
    title: '',
    highlightText: '',
    subtitle: '',
    alignment: 'center'
  }),
  cards: () => []
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const normalizedHeading = computed<ValueCardsHeading>(() => {
  const source = props.heading || emptyHeading
  return {
    label: source.label || '',
    title: source.title || '',
    highlightText: source.highlightText || '',
    subtitle: source.subtitle || '',
    alignment: source.alignment || emptyHeading.alignment
  }
})

const sortedCards = computed<ValueCard[]>(() => {
  return [...(props.cards || [])]
    .filter((card) => card?.title || card?.description)
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
})

const hasHeadingContent = computed(() => Boolean(
  normalizedHeading.value.label
  || normalizedHeading.value.title
  || normalizedHeading.value.highlightText
  || normalizedHeading.value.subtitle
))

const hasContent = computed(() => hasHeadingContent.value || sortedCards.value.length > 0)

const iconKeyFor = (card: ValueCard) => resolveIconKey(card.iconKey) || 'target'

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
    class="w-full overflow-x-clip"
    :aria-labelledby="hasHeadingContent ? 'services-value-cards-title' : undefined"
  >
    <SectionHeading
      id="services-value-cards-title"
      :heading="normalizedHeading"
      :alignment="normalizedHeading.alignment as 'left' | 'center' | 'right' | ''"
      reveal-class="services-values-heading-reveal"
      :visible="isVisible"
      margin-bottom-class="mb-10 md:mb-12 lg:mb-14"
      max-width="max-w-[50rem]"
    />

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-7">
      <article
        v-for="(card, index) in sortedCards"
        :key="card.id || `services-value-${index}`"
        class="services-value-card group flex h-full flex-col rounded-[1.7rem] border border-[#dfe7ee] bg-white p-8 shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
        :class="{ 'is-visible': isVisible }"
        :style="{ '--card-delay': `${index * 100}ms` }"
      >
          <span class="services-value-icon mb-7 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf7f2] text-[#006c4f]" aria-hidden="true">
          <AppIcon :icon-key="iconKeyFor(card)" :title="card.title" class="h-7 w-7" />
        </span>

        <h3 class="text-[1.24rem] font-bold leading-[1.3] tracking-[-0.01em] text-[#001c2a]">
          {{ card.title }}
        </h3>

        <p v-if="card.description" class="mt-3 text-[0.98rem] leading-[1.8] text-slate-600">
          {{ card.description }}
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.services-values-heading-reveal,
.services-value-card {
  opacity: 0;
  transform: translateY(20px);
}

.services-values-heading-reveal.is-visible {
  animation: servicesValuesFadeUp 0.7s ease-out both;
}

.services-value-card.is-visible {
  animation: servicesValuesFadeUp 0.7s ease-out var(--card-delay, 0ms) both;
}

.services-value-card {
  transition: transform 0.26s ease, box-shadow 0.26s ease, border-color 0.26s ease;
}

.services-value-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 24px 52px rgba(15, 23, 42, 0.12);
  border-color: #b7dacd;
}

.services-value-icon {
  transition: transform 0.24s ease, background-color 0.24s ease, color 0.24s ease;
}

.services-value-card:hover .services-value-icon {
  transform: scale(1.05);
  background-color: #def3e9;
  color: #006c4f;
}

@keyframes servicesValuesFadeUp {
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
  .services-values-heading-reveal,
  .services-value-card {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none;
  }

  .services-value-card:hover,
  .services-value-card:hover .services-value-icon {
    transform: none;
  }
}
</style>
