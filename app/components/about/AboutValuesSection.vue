<script setup lang="ts">
import type { AboutSectionHeading, AboutValueItem } from '~/types/about'
import { resolveIconKey } from '~/utils/iconMap'

const props = withDefaults(defineProps<{
  heading?: AboutSectionHeading | null
  values?: AboutValueItem[]
}>(), {
  heading: () => ({
    label: '',
    title: '',
    highlightText: '',
    subtitle: '',
    alignment: 'center'
  }),
  values: () => []
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const fallbackIconKey = 'target'

const sortedValues = computed(() => {
  return [...(props.values || [])]
    .filter(value => value?.title || value?.description)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
})

const hasValues = computed(() => sortedValues.value.length > 0)

const headingData = computed(() => ({
  ...(props.heading || {}),
  alignment: (props.heading?.alignment || 'center')
}))

const iconKeyFor = (value: AboutValueItem) => {
  const resolved = resolveIconKey(value?.iconKey)
  return resolved || fallbackIconKey
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
    v-if="hasValues"
    ref="sectionRef"
    class="w-full overflow-x-clip"
    aria-labelledby="about-values-title"
  >
    <div class="mx-auto max-w-[1120px]">
      <div class="values-heading-reveal" :class="{ 'is-visible': isVisible }">
        <SectionHeading
          id="about-values-title"
          :heading="headingData"
          alignment="center"
          :center-container="true"
          margin-bottom-class="mb-10 md:mb-12 lg:mb-14"
          max-width="max-w-[50rem]"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-7">
        <article
          v-for="(value, index) in sortedValues"
          :key="value.id || `about-value-${index}`"
          class="value-card group flex h-full flex-col rounded-[1.7rem] border border-[#dfe7ee] bg-white p-8 shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
          :class="{ 'is-visible': isVisible }"
          :style="{ '--card-delay': `${index * 100}ms` }"
        >
          <span class="value-icon mb-7 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf7f2] text-[#006c4f]" aria-hidden="true">
            <AppIcon
              :icon-key="iconKeyFor(value)"
              :title="value.title"
              class="h-7 w-7"
            />
          </span>

          <h3 class="text-[1.24rem] font-bold leading-[1.3] tracking-[-0.01em] text-[#001c2a]">
            {{ value.title }}
          </h3>

          <p v-if="value.description" class="mt-3 text-[0.98rem] leading-[1.8] text-slate-600">
            {{ value.description }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.values-heading-reveal,
.value-card {
  opacity: 0;
  transform: translateY(20px);
}

.values-heading-reveal.is-visible {
  animation: valuesFadeUp 0.7s ease-out both;
}

.value-card.is-visible {
  animation: valuesFadeUp 0.7s ease-out var(--card-delay, 0ms) both;
}

.value-card {
  transition: transform 0.26s ease, box-shadow 0.26s ease, border-color 0.26s ease;
}

.value-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 24px 52px rgba(15, 23, 42, 0.12);
  border-color: #b7dacd;
}

.value-icon {
  transition: transform 0.24s ease, background-color 0.24s ease, color 0.24s ease;
}

.value-card:hover .value-icon {
  transform: scale(1.05);
  background-color: #def3e9;
  color: #006c4f;
}

@keyframes valuesFadeUp {
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
  .values-heading-reveal,
  .value-card {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none;
  }

  .value-card:hover,
  .value-card:hover .value-icon {
    transform: none;
  }
}
</style>
