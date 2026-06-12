<script setup lang="ts">
import type { AboutApproachStep, AboutSectionHeading } from '~/types/about'

const props = withDefaults(defineProps<{
  heading?: AboutSectionHeading | null
  steps?: AboutApproachStep[]
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
  return [...(props.steps || [])]
    .filter((step) => step?.title || step?.description)
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
})

const hasContent = computed(() => sortedSteps.value.length > 0)

const formattedStepNumber = (stepNumber: string, index: number) => {
  const value = String(stepNumber || '').trim()
  if (value) return value
  return String(index + 1).padStart(2, '0')
}

const isAccentStep = (index: number) => index === 1

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
    aria-labelledby="about-approach-title"
  >
    <SectionHeading
      id="about-approach-title"
      :heading="heading"
      alignment="center"
      reveal-class="approach-heading-reveal"
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
          :key="step.id || `about-approach-step-${index}`"
          class="approach-step-reveal group flex flex-col items-center text-center"
          :class="{ 'is-visible': isVisible }"
          :style="{ '--approach-delay': `${80 + (index * 100)}ms` }"
        >
          <span
            class="approach-circle mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-white text-[1.5rem] font-bold leading-none text-[#001c2a] shadow-[0_10px_26px_rgba(15,23,42,0.08)] md:h-26 md:w-26"
          >
            {{ formattedStepNumber(step.stepNumber, index) }}
          </span>

          <h3 class="approach-title max-w-[15rem] text-[1.12rem] font-semibold leading-[1.35] text-[#001c2a] md:text-[1.18rem]">
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
.approach-heading-reveal,
.approach-step-reveal {
  opacity: 0;
  transform: translateY(20px);
}

.approach-heading-reveal.is-visible {
  animation: approachFadeUp 0.7s ease-out both;
}

.approach-step-reveal.is-visible {
  animation: approachFadeUp 0.72s ease-out var(--approach-delay, 100ms) both;
}

.approach-circle,
.approach-title {
  transition: transform 0.28s ease, border-color 0.28s ease, color 0.28s ease, box-shadow 0.28s ease;
}

.approach-step-reveal:hover .approach-circle {
  transform: translateY(-3px);
  border-color: #27b38a;
  color: #006c4f;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
}

.approach-step-reveal:hover .approach-title {
  color: #006c4f;
}

@keyframes approachFadeUp {
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
  .approach-heading-reveal,
  .approach-step-reveal {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none;
  }

  .approach-step-reveal:hover .approach-circle {
    transform: none;
  }
}
</style>
