<script setup lang="ts">
import type { AboutPillarItem, AboutSectionHeading } from '~/types/about'
import { resolveIconKey } from '~/utils/iconMap'

const props = withDefaults(defineProps<{
  heading?: AboutSectionHeading | null
  pillars?: AboutPillarItem[]
}>(), {
  heading: () => ({
    label: '',
    title: '',
    highlightText: '',
    subtitle: '',
    alignment: 'left'
  }),
  pillars: () => []
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const fallbackIconKey = 'target'

const headingData = computed(() => ({
  ...(props.heading || {}),
  alignment: 'left'
}))

const sortedPillars = computed(() => {
  return [...(props.pillars || [])]
    .filter(pillar => pillar?.title || pillar?.description)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
})

const hasPillars = computed(() => sortedPillars.value.length > 0)

const variantOrder = ['large_dark', 'tall_green', 'small_light', 'small_white'] as const

const normalizedPillars = computed(() => {
  const source = sortedPillars.value
  if (!source.length) return []

  const used = new Set<number>()
  const arranged: AboutPillarItem[] = []

  for (const variant of variantOrder) {
    const index = source.findIndex((pillar, i) => !used.has(i) && resolveVariant(pillar.variant) === variant)
    if (index >= 0) {
      used.add(index)
      arranged.push(source[index] as AboutPillarItem)
    }
  }

  source.forEach((pillar, i) => {
    if (!used.has(i)) arranged.push(pillar)
  })

  return arranged
})

const resolveVariant = (variant?: string | null) => {
  const key = String(variant || '').trim().toLowerCase()
  if (key === 'large_dark' || key === 'tall_green' || key === 'small_light' || key === 'small_white') {
    return key
  }
  return 'small_white'
}

const cardClassFor = (variant?: string | null) => {
  const key = resolveVariant(variant)

  if (key === 'large_dark') {
    return 'pillar-card-dark text-white lg:col-span-8 lg:row-span-1 md:col-span-2'
  }

  if (key === 'tall_green') {
    return 'pillar-card-green text-[#001c2a] lg:col-span-4 lg:row-span-2 md:col-span-1 md:row-span-2'
  }

  if (key === 'small_light') {
    return 'pillar-card-light text-[#001c2a] lg:col-span-4 lg:row-span-1 md:col-span-1'
  }

  return 'pillar-card-white text-[#001c2a] lg:col-span-4 lg:row-span-1 md:col-span-1'
}

const iconKeyFor = (pillar: AboutPillarItem) => {
  const key = resolveIconKey(pillar.iconKey)
  return key || fallbackIconKey
}

const hasImage = (pillar: AboutPillarItem) => Boolean(pillar.image)

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
    v-if="hasPillars"
    ref="sectionRef"
    class="w-full overflow-x-clip"
    aria-labelledby="about-core-pillars-title"
  >
    <div class="mx-auto max-w-[1120px]">
      <div class="pillars-heading-reveal" :class="{ 'is-visible': isVisible }">
        <SectionHeading
          id="about-core-pillars-title"
          :heading="headingData"
          alignment="left"
          :center-container="false"
          max-width="max-w-[52rem]"
          margin-bottom-class="mb-10 md:mb-12"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2 lg:gap-7">
        <component
          :is="pillar.link ? 'NuxtLink' : 'article'"
          v-for="(pillar, index) in normalizedPillars"
          :key="pillar.id || `about-pillar-${index}`"
          :to="pillar.link || undefined"
          class="pillar-card group relative flex min-h-[16rem] flex-col overflow-hidden rounded-[1.8rem] p-7 md:min-h-[18rem] md:p-8 lg:min-h-[15.5rem]"
          :class="[cardClassFor(pillar.variant), { 'is-visible': isVisible }]"
          :style="{ '--card-delay': `${index * 100}ms` }"
        >
          <img
            v-if="resolveVariant(pillar.variant) === 'large_dark' && hasImage(pillar)"
            :src="pillar.image"
            :alt="pillar.title || 'Core pillar image'"
            class="pillar-image absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          >
          <div
            v-if="resolveVariant(pillar.variant) === 'large_dark'"
            class="absolute inset-0 bg-gradient-to-b from-[#001c2a]/30 via-[#001c2a]/55 to-[#001c2a]/88"
            aria-hidden="true"
          />

          <div class="relative z-[1] flex h-full flex-col">
            <span class="pillar-icon mb-7 inline-flex h-14 w-14 items-center justify-center rounded-full" :class="resolveVariant(pillar.variant) === 'large_dark' ? 'bg-white/16 text-white' : 'bg-[#eaf7f2] text-[#006c4f]'" aria-hidden="true">
              <AppIcon
                :icon-key="iconKeyFor(pillar)"
                :title="pillar.title"
                class="h-7 w-7"
              />
            </span>

            <div class="mt-auto">
              <h3
                class="text-[1.3rem] font-bold leading-[1.28] tracking-[-0.01em]"
                :class="resolveVariant(pillar.variant) === 'large_dark' ? 'text-white' : 'text-[#001c2a]'"
              >
                {{ pillar.title }}
              </h3>
              <p
                v-if="pillar.description"
                class="mt-3 text-[0.98rem] leading-[1.78]"
                :class="resolveVariant(pillar.variant) === 'large_dark' ? 'text-white/90' : 'text-slate-600'"
              >
                {{ pillar.description }}
              </p>
            </div>
          </div>
        </component>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pillars-heading-reveal,
.pillar-card {
  opacity: 0;
  transform: translateY(20px);
}

.pillars-heading-reveal.is-visible {
  animation: pillarsFadeUp 0.68s ease-out both;
}

.pillar-card.is-visible {
  animation: pillarsFadeUp 0.72s ease-out var(--card-delay, 0ms) both;
}

.pillar-card {
  transition: transform 0.27s ease, box-shadow 0.27s ease, opacity 0.27s ease;
}

.pillar-card-dark {
  background: linear-gradient(145deg, #0a3146 0%, #001c2a 100%);
  box-shadow: 0 20px 44px rgba(0, 28, 42, 0.28);
}

.pillar-card-green {
  background: linear-gradient(160deg, #d6f7ea 0%, #b9eed8 100%);
  box-shadow: 0 18px 38px rgba(0, 108, 79, 0.18);
}

.pillar-card-light {
  background: #eaf1f6;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.1);
}

.pillar-card-white {
  background: #ffffff;
  border: 1px solid #dfe7ee;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
}

.pillar-image {
  transition: transform 0.45s ease;
}

.pillar-icon {
  transition: transform 0.24s ease, opacity 0.24s ease;
}

.pillar-card:hover {
  transform: translateY(-5px);
}

.pillar-card:hover .pillar-icon {
  transform: scale(1.04);
}

.pillar-card-dark:hover .pillar-image {
  transform: scale(1.04);
}

.pillar-card-dark:hover {
  box-shadow: 0 26px 56px rgba(0, 28, 42, 0.36);
}

.pillar-card-green:hover {
  box-shadow: 0 24px 50px rgba(0, 108, 79, 0.22);
}

.pillar-card-light:hover,
.pillar-card-white:hover {
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.13);
}

@keyframes pillarsFadeUp {
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
  .pillars-heading-reveal,
  .pillar-card {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none;
  }

  .pillar-image {
    transition: none;
  }

  .pillar-card:hover,
  .pillar-card:hover .pillar-icon,
  .pillar-card-dark:hover .pillar-image {
    transform: none;
  }
}
</style>
