<script setup lang="ts">
import type { AboutCompetency, AboutSectionHeading, AboutStoryParagraph } from '~/types/about'

const props = withDefaults(defineProps<{
  heading?: AboutSectionHeading | null
  paragraphs?: AboutStoryParagraph[]
  competenciesTitle?: string
  competencies?: AboutCompetency[]
}>(), {
  heading: () => ({
    label: '',
    title: '',
    highlightText: '',
    subtitle: '',
    alignment: 'left'
  }),
  paragraphs: () => [],
  competenciesTitle: '',
  competencies: () => []
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const headingData = computed(() => ({
  ...(props.heading || {}),
  alignment: (props.heading?.alignment || 'left')
}))

const sortedParagraphs = computed(() => {
  return [...(props.paragraphs || [])]
    .filter(item => item?.content)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
})

const sortedCompetencies = computed(() => {
  return [...(props.competencies || [])]
    .filter(item => item?.label)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
})

const hasStory = computed(() => Boolean(
  headingData.value?.label
  || headingData.value?.title
  || headingData.value?.subtitle
  || sortedParagraphs.value.length
))

const hasCard = computed(() => Boolean(props.competenciesTitle || sortedCompetencies.value.length))

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
  }, { threshold: 0.24, rootMargin: '0px 0px -10% 0px' })

  if (sectionRef.value) observer.observe(sectionRef.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section
    v-if="hasStory || hasCard"
    ref="sectionRef"
    class="about-story-grid overflow-x-clip lg:gap-16 xl:gap-20"
    aria-labelledby="about-story-title"
  >
    <div class="story-reveal" :class="{ 'is-visible': isVisible }">
      <SectionHeading
        id="about-story-title"
        :heading="headingData"
        alignment="left"
        :visible="true"
        max-width="max-w-[42rem]"
        :center-container="false"
        margin-bottom-class="mb-8 md:mb-10"
      />

      <div v-if="sortedParagraphs.length" class="max-w-[42rem] space-y-5 text-[1rem] leading-[1.85] text-slate-700 md:text-[1.04rem]">
        <p
          v-for="(paragraph, index) in sortedParagraphs"
          :key="`story-paragraph-${index}-${paragraph.order}`"
        >
          {{ paragraph.content }}
        </p>
      </div>
    </div>

    <aside
      v-if="hasCard"
      class="card-reveal relative"
      :class="{ 'is-visible': isVisible }"
      aria-label="Our Core Competencies"
    >
      <div class="competencies-card relative overflow-hidden rounded-[1.8rem] border border-[#e1ebe6] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.09)] sm:p-9 lg:p-10">
        <div class="mint-glow pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full" aria-hidden="true" />
        <h3 v-if="competenciesTitle" class="relative text-[1.4rem] font-bold leading-tight tracking-[-0.02em] text-[#001c2a] md:text-[1.55rem]">
          {{ competenciesTitle }}
        </h3>

        <ul
          v-if="sortedCompetencies.length"
          class="relative mt-6 flex flex-wrap gap-3"
        >
          <li
            v-for="(competency, index) in sortedCompetencies"
            :key="`competency-${index}-${competency.label}`"
            class="competency-chip"
            :style="{ '--chip-delay': `${index * 45}ms` }"
          >
            {{ competency.label }}
          </li>
        </ul>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.about-story-grid {
  display: grid;
  gap: 2.5rem;
}

@media (min-width: 1024px) {
  .about-story-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 29rem);
    align-items: center;
  }
}

.story-reveal,
.card-reveal {
  opacity: 0;
  transform: translateY(20px);
}

.story-reveal.is-visible {
  animation: aboutStoryFadeUp 0.72s ease-out both;
}

.card-reveal.is-visible {
  animation: aboutStoryFadeUp 0.78s ease-out 90ms both;
}

.competencies-card {
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
}

.competencies-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 24px 54px rgba(15, 23, 42, 0.12);
  border-color: #d5e6dd;
}

.mint-glow {
  background: radial-gradient(circle at center, rgba(103, 252, 198, 0.28) 0%, rgba(103, 252, 198, 0) 72%);
}

.competency-chip {
  border: 1px solid #bfe9d6;
  background: #e9fbf2;
  color: #006c4f;
  border-radius: 9999px;
  padding: 0.5rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.3;
  transition: transform 0.22s ease, background-color 0.22s ease, border-color 0.22s ease;
  animation: chipFadeIn 0.44s ease-out var(--chip-delay, 0ms) both;
}

.competency-chip:hover {
  transform: translateY(-2px);
  background: #dcf8ec;
  border-color: #9ddfc2;
}

@keyframes aboutStoryFadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes chipFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .story-reveal,
  .card-reveal {
    opacity: 1;
    transform: none;
    animation: none !important;
  }

  .competencies-card,
  .competency-chip {
    transition: none;
    animation: none !important;
  }

  .competencies-card:hover,
  .competency-chip:hover {
    transform: none;
  }
}
</style>
