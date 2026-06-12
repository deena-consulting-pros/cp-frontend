<script setup lang="ts">
import type { HomepageData } from '~/types/homepage'

type TestimonialsHeading = HomepageData['testimonialsHeading']
type Testimonial = HomepageData['testimonials'][number]

const props = withDefaults(defineProps<{
  heading?: TestimonialsHeading
  testimonials?: Testimonial[]
}>(), {
  heading: () => ({
    label: '',
    title: '',
    subtitle: '',
    highlightText: '',
    alignment: 'center'
  }),
  testimonials: () => []
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const prefersReducedMotion = ref(false)
let observer: IntersectionObserver | null = null

const visibleTestimonials = computed(() => props.testimonials || [])
const hasContent = computed(() => visibleTestimonials.value.length > 0)
const marqueeTestimonials = computed(() => [...visibleTestimonials.value, ...visibleTestimonials.value])

const starSlots = [1, 2, 3, 4, 5] as const

const cardDelay = (index: number) => `${180 + index * 70}ms`
const ratingLabel = (rating: number) => `${rating} out of 5 stars`

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'CP'
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('')
}

const personDetail = (item: Testimonial) => {
  if (item.clientPosition && item.companyName) return `${item.clientPosition}, ${item.companyName}`
  return item.clientPosition || item.companyName || ''
}

onMounted(() => {
  if (!import.meta.client) return
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion.value) {
    isVisible.value = true
    return
  }

  observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      isVisible.value = true
      observer?.disconnect()
    }
  }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' })

  if (sectionRef.value) observer.observe(sectionRef.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    v-if="hasContent"
    ref="sectionRef"
    aria-labelledby="testimonials-section-title"
  >
    <SectionHeading
      id="testimonials-section-title"
      :heading="heading"
      alignment="center"
      max-width="max-w-[44rem]"
      reveal-class="testimonials-heading-reveal"
      :visible="isVisible"
      :center-container="true"
      margin-bottom-class="mb-10 md:mb-12"
    />

    <div class="relative left-1/2 right-1/2 w-screen -translate-x-1/2">
      <div aria-hidden="true" class="fade-edge fade-edge-left" />
      <div aria-hidden="true" class="fade-edge fade-edge-right" />

      <div
        class="testimonials-track-wrap testimonials-track-reveal"
        :class="{
          'is-visible': isVisible,
          'is-reduced-motion': prefersReducedMotion
        }"
      >
        <ul class="testimonials-track" :class="{ 'is-reduced-motion': prefersReducedMotion }">
          <li
            v-for="(item, index) in marqueeTestimonials"
            :key="`${item.id}-${index}`"
            class="testimonial-card"
            :style="{ '--delay': cardDelay(index) }"
          >
            <article class="h-full rounded-[1.6rem] border border-white/70 bg-white/85 p-8 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-10">
              <p class="sr-only" :aria-label="ratingLabel(item.rating)">{{ ratingLabel(item.rating) }}</p>
              <div class="mb-5 flex items-center gap-1.5 text-[#0b8f67]" :aria-label="ratingLabel(item.rating)" role="img">
                <span v-for="slot in starSlots" :key="slot" class="text-lg leading-none" aria-hidden="true">
                  {{ slot <= item.rating ? '★' : '☆' }}
                </span>
              </div>

              <blockquote class="mb-7 text-[1.02rem] italic leading-8 text-slate-700">
                "{{ item.quote }}"
              </blockquote>

              <div class="flex items-center gap-3.5">
                <img
                  v-if="item.clientImage"
                  :src="item.clientImage"
                  :alt="item.clientName || 'Client photo'"
                  class="h-12 w-12 rounded-full object-cover ring-2 ring-white/80"
                  loading="lazy"
                  decoding="async"
                >
                <div
                  v-else
                  class="flex h-12 w-12 items-center justify-center rounded-full bg-[#006c4f] text-sm font-semibold text-white ring-2 ring-white/80"
                  aria-hidden="true"
                >
                  {{ getInitials(item.clientName) }}
                </div>

                <div>
                  <p class="text-base font-semibold text-slate-900">{{ item.clientName }}</p>
                  <p v-if="personDetail(item)" class="text-sm text-slate-600">{{ personDetail(item) }}</p>
                </div>
              </div>
            </article>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.testimonials-heading-reveal,
.testimonials-track-reveal {
  opacity: 0;
  transform: translateY(24px);
}

.testimonials-heading-reveal.is-visible {
  animation: testimonialsFadeUp 0.68s ease-out both;
}

.testimonials-track-reveal.is-visible {
  animation: testimonialsFadeUp 0.72s ease-out 100ms both;
}

.testimonials-track-wrap {
  overflow: hidden;
}

.testimonials-track {
  display: flex;
  align-items: stretch;
  gap: 1.15rem;
  width: max-content;
  animation: testimonialsScroll 40s linear infinite;
  will-change: transform;
  padding: 2rem 1rem;
}

.testimonials-track-wrap:hover .testimonials-track {
  animation-play-state: paused;
}

.testimonial-card {
  width: min(85vw, 28rem);
  min-width: min(85vw, 28rem);
}

.fade-edge {
  position: absolute;
  top: 0;
  z-index: 2;
  height: 100%;
  width: clamp(2rem, 5vw, 5rem);
  pointer-events: none;
  background: linear-gradient(to right, #f8fafc 0%, rgba(248, 250, 252, 0) 100%);
}

.fade-edge-left {
  left: 0;
}

.fade-edge-right {
  right: 0;
  transform: rotate(180deg);
}

@keyframes testimonialsFadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes testimonialsScroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-50% - 0.575rem));
  }
}

@media (min-width: 768px) {
  .testimonials-track {
    gap: 1.35rem;
    padding: 2rem;
  }

  .testimonial-card {
    width: clamp(24rem, 42vw, 28rem);
    min-width: clamp(24rem, 42vw, 28rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .testimonials-heading-reveal,
  .testimonials-track-reveal {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none !important;
  }

  .testimonials-track {
    animation: none;
    transform: none;
    overflow-x: auto;
    scroll-snap-type: x proximity;
    padding-bottom: 0.25rem;
  }

  .testimonials-track-wrap:hover .testimonials-track {
    animation: none;
  }

  .testimonial-card {
    scroll-snap-align: start;
  }
}
</style>
