<script setup lang="ts">
import type { AboutEdgeItem, AboutSectionHeading } from '~/types/about'
import { resolveIconKey } from '~/utils/iconMap'

const props = withDefaults(defineProps<{
  heading?: AboutSectionHeading | null
  items?: AboutEdgeItem[]
  image?: string | null
}>(), {
  heading: () => ({
    label: '',
    title: '',
    highlightText: '',
    subtitle: '',
    alignment: 'left'
  }),
  items: () => [],
  image: ''
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const fallbackIconKey = 'target'

const headingData = computed(() => ({
  ...(props.heading || {}),
  alignment: 'left'
}))

const sortedItems = computed(() => {
  return [...(props.items || [])]
    .filter(item => item?.title || item?.description)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
})

const hasContent = computed(() => Boolean(
  headingData.value?.label
  || headingData.value?.title
  || headingData.value?.subtitle
  || sortedItems.value.length
  || props.image
))

const iconKeyFor = (item: AboutEdgeItem) => {
  const resolved = resolveIconKey(item.iconKey)
  return resolved || fallbackIconKey
}

const imageAlt = computed(() => {
  const title = headingData.value?.title || 'The Consulting Pros Edge'
  return `${title} section image`
})

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
    class="about-edge-section relative w-full overflow-hidden bg-[#001c2a] py-16 md:py-24 lg:py-28"
    aria-labelledby="about-edge-title"
  >
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute -top-32 left-[-12%] h-[24rem] w-[24rem] rounded-full bg-[#67fcc6]/10 blur-3xl" />
      <div class="absolute -bottom-28 right-[-8%] h-[22rem] w-[22rem] rounded-full bg-[#4ea6c8]/10 blur-3xl" />
    </div>

    <div class="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        <div class="edge-content edge-reveal-left" :class="{ 'is-visible': isVisible }">
          <SectionHeading
            id="about-edge-title"
            :heading="headingData"
            alignment="left"
            :dark="true"
            :center-container="false"
            max-width="max-w-[38rem]"
            margin-bottom-class="mb-8 md:mb-10"
            title-class="text-[2rem] font-bold leading-[1.16] tracking-[-0.02em] md:text-[2.55rem] lg:text-[2.9rem]"
            subtitle-class="text-[1rem] leading-[1.85] text-slate-300 md:text-[1.05rem]"
            label-class="text-sm font-semibold uppercase tracking-[0.18em]"
            title-color="#ffffff"
            subtitle-color="#cdd9e5"
            label-color="#67fcc6"
          />

          <ul v-if="sortedItems.length" class="space-y-6 md:space-y-7">
            <li
              v-for="(item, index) in sortedItems"
              :key="item.id || `about-edge-item-${index}`"
              class="edge-item flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 md:p-5"
              :class="{ 'is-visible': isVisible }"
              :style="{ '--edge-delay': `${120 + (index * 90)}ms` }"
            >
              <span class="edge-icon mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#67fcc6]/12 text-[#67fcc6]" aria-hidden="true">
                <AppIcon
                  :icon-key="iconKeyFor(item)"
                  :title="item.title"
                  class="h-5 w-5"
                />
              </span>
              <div>
                <h3 class="text-[1.06rem] font-semibold leading-[1.35] text-white md:text-[1.12rem]">
                  {{ item.title }}
                </h3>
                <p v-if="item.description" class="mt-2 text-[0.95rem] leading-[1.8] text-slate-300 md:text-[0.98rem]">
                  {{ item.description }}
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div
          v-if="image"
          class="edge-image-wrap edge-reveal-right"
          :class="{ 'is-visible': isVisible }"
        >
          <figure class="edge-image-card overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-[0_24px_65px_rgba(0,0,0,0.34)] md:p-5">
            <img
              :src="image"
              :alt="imageAlt"
              class="edge-image h-[17rem] w-full rounded-[1.25rem] object-cover object-center md:h-[23rem] lg:h-[26rem]"
              loading="lazy"
              decoding="async"
            >
          </figure>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.edge-reveal-left,
.edge-reveal-right,
.edge-item {
  opacity: 0;
}

.edge-reveal-left,
.edge-reveal-right {
  transform: translateY(20px);
}

.edge-item {
  transform: translateY(18px);
}

.edge-reveal-left.is-visible {
  animation: edgeFadeUp 0.7s ease-out both;
}

.edge-reveal-right.is-visible {
  animation: edgeFadeUp 0.72s ease-out 120ms both;
}

.edge-item.is-visible {
  animation: edgeFadeUp 0.7s ease-out var(--edge-delay, 140ms) both;
}

.edge-item,
.edge-image-card,
.edge-icon,
.edge-image {
  transition: transform 0.28s ease, box-shadow 0.28s ease, filter 0.28s ease, background-color 0.28s ease;
}

.edge-item:hover {
  transform: translateY(-3px);
  background-color: rgba(255, 255, 255, 0.055);
}

.edge-item:hover .edge-icon {
  transform: scale(1.05);
  background-color: rgba(103, 252, 198, 0.2);
}

.edge-image-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 78px rgba(0, 0, 0, 0.44);
}

.edge-image {
  filter: grayscale(12%) brightness(0.92);
}

.edge-image-card:hover .edge-image {
  transform: scale(1.02);
  filter: grayscale(0%) brightness(0.98);
}

@keyframes edgeFadeUp {
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
  .edge-reveal-left,
  .edge-reveal-right,
  .edge-item {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none;
  }

  .edge-item:hover,
  .edge-item:hover .edge-icon,
  .edge-image-card:hover,
  .edge-image-card:hover .edge-image {
    transform: none;
  }

  .edge-image {
    filter: none;
  }
}
</style>
