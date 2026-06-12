<script setup lang="ts">
import type { HomepageData } from '~/types/homepage'

type ProcessHeading = HomepageData['processHeading']
type ProcessStep = HomepageData['processSteps'][number]

const props = withDefaults(defineProps<{
  heading?: ProcessHeading
  steps?: ProcessStep[]
}>(), {
  heading: () => ({
    label: '',
    title: '',
    subtitle: '',
    highlightText: '',
    alignment: 'center'
  }),
  steps: () => []
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const sortedSteps = computed(() => {
  const list = [...(props.steps || [])]
  const hasOrder = list.some((step) => typeof step.order === 'number')
  if (!hasOrder) return list
  return list.sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
})

const hasContent = computed(() => Boolean(
  sortedSteps.value.length
  && (props.heading?.title || props.heading?.subtitle || props.heading?.label)
))

const formattedStepNumber = (value: string, index: number) => {
  const fromValue = String(value || '').trim()
  if (fromValue) return fromValue
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
  }, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' })

  if (sectionRef.value) observer.observe(sectionRef.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    v-if="hasContent"
    ref="sectionRef"
    aria-labelledby="process-section-title"
  >
    <SectionHeading
      id="process-section-title"
      :heading="heading"
      reveal-class="process-reveal"
      :visible="isVisible"
    />

    <div class="relative">
      <div
        class="pointer-events-none absolute left-0 right-0 top-7 z-0 hidden border-t border-slate-300/70 lg:block"
        aria-hidden="true"
      />

      <ol class="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <li
          v-for="(step, index) in sortedSteps"
          :key="step.id"
          class="process-card-reveal process-card group rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
          :class="{ 'is-visible': isVisible }"
          :style="{ '--delay': `${80 + index * 100}ms` }"
        >
          <span class="step-circle mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#001c2a] text-base font-bold leading-none text-white">
            {{ formattedStepNumber(step.stepNumber, index) }}
          </span>
          <h3 class="text-xl font-bold leading-snug text-[#001c2a]">{{ step.title }}</h3>
          <p v-if="step.description" class="mt-3 text-[0.98rem] leading-7 text-slate-600">{{ step.description }}</p>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.process-reveal,
.process-card-reveal {
  opacity: 0;
  transform: translateY(24px);
}

.process-reveal.is-visible {
  animation: processFadeUp 0.7s ease-out both;
}

.process-card-reveal.is-visible {
  animation: processFadeUp 0.72s ease-out var(--delay, 0ms) both;
}

.process-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.step-circle {
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.process-card:hover {
  transform: translateY(-0.4rem);
  box-shadow: 0 22px 42px rgba(15, 23, 42, 0.12);
  border-color: #cbd5e1;
}

.process-card:hover .step-circle {
  background-color: #006c4f;
  transform: translateY(-0.08rem);
}

@keyframes processFadeUp {
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
  .process-reveal,
  .process-card-reveal {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none;
  }

  .process-card:hover,
  .process-card:hover .step-circle {
    transform: none;
  }
}
</style>
