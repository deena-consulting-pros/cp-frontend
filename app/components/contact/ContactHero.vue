<script setup lang="ts">
import type { ContactPageData } from '~/types/contact'

const props = withDefaults(defineProps<{
  hero?: ContactPageData['hero']
  heroPoints?: ContactPageData['heroPoints']
}>(), {
  hero: () => ({
    eyebrowText: '',
    title: '',
    highlightText: '',
    description: '',
    heroImage: '',
    primaryButtonText: '',
    primaryButtonUrl: '',
    primaryButtonNewTab: false
  }),
  heroPoints: () => []
})

const { resolveImageUrl } = useStrapi()

const resolvedHeroPoints = computed(() => {
  if (props.heroPoints.length) return props.heroPoints
  return [
    { id: 'hero-point-1', text: 'Strategic growth roadmaps', iconKey: 'line-chart', order: 0 },
    { id: 'hero-point-2', text: 'Digital execution support', iconKey: 'globe', order: 1 },
    { id: 'hero-point-3', text: 'Clear next-step planning', iconKey: 'check-circle', order: 2 }
  ]
})

const heroImageUrl = computed(() => resolveImageUrl(props.hero?.heroImage || ''))
const sortedCards = computed(() => {
  return [...resolvedHeroPoints.value]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((point, index) => ({
      id: point.id || `contact-hero-card-${index}`,
      title: point.text,
      iconKey: point.iconKey
    }))
    .slice(0, 3)
})

const hasCards = computed(() => sortedCards.value.length > 0)

const cardPlacementClass = (index: number) => {
  if (index === 0) return 'card-top-right'
  if (index === 1) return 'card-bottom-left'
  if (index === 2) return 'card-bottom-right'
  return 'card-top-left'
}

const cardMotionClass = (index: number) => (index % 2 === 0 ? 'float-slow' : 'float-mid')
</script>

<template>
  <section class="hero-wrap relative overflow-hidden">
    <div class="pointer-events-none absolute inset-0 z-0">
      <div class="absolute -right-[8%] top-[4%] h-[24rem] w-[24rem] rounded-full blur-[100px]" style="background-color: rgba(103, 252, 198, 0.18);" />
      <div class="absolute -bottom-[16%] -left-[8%] h-[18rem] w-[18rem] rounded-full blur-[90px]" style="background-color: rgba(0, 28, 42, 0.08);" />
    </div>

    <div class="relative z-10 mx-auto w-full max-w-[1280px] px-4 py-20 sm:px-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10 lg:py-24">
      <div>
        <p class="eyebrow mb-5">{{ hero?.eyebrowText || 'GET IN TOUCH' }}</p>
        <h1 class="hero-main-title max-w-[39rem] text-[#001c2a]">{{ hero?.title || 'Let\'s Build Your Next Digital Growth Step' }}</h1>
        <p class="mt-7 max-w-[37rem] text-[1.08rem] leading-[1.72] text-slate-700">
          {{ hero?.description || 'Tell us what you\'re working on, and we\'ll help you find the right way forward with strategic precision and digital innovation.' }}
        </p>

        <NuxtLink
          :to="hero?.primaryButtonUrl || '#contact-form'"
          class="hero-cta mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-[0_14px_34px_rgba(0,28,42,0.28)]"
          :target="hero?.primaryButtonNewTab ? '_blank' : undefined"
          :rel="hero?.primaryButtonNewTab ? 'noopener noreferrer' : undefined"
        >
          {{ hero?.primaryButtonText || 'Send a Message' }}
        </NuxtLink>

      </div>

      <div class="relative mx-auto w-full max-w-[38rem] lg:mx-0">
        <div class="hero-image-card relative w-full overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-4 shadow-[0_34px_80px_rgba(8,26,39,0.16)] backdrop-blur-[14px] sm:p-5">
          <div class="relative h-[22rem] overflow-hidden rounded-[1.35rem] bg-[linear-gradient(155deg,#ebf7f0,#dce9f4)] sm:h-[25rem] lg:h-[28rem]">
            <img
              v-if="heroImageUrl"
              :src="heroImageUrl"
              :alt="hero?.title || 'Contact Consulting Pros'"
              class="h-full w-full object-cover object-center"
              loading="eager"
              decoding="async"
            >
            <div v-else class="h-full w-full p-5 sm:p-7">
              <div class="h-full w-full rounded-[1.1rem] border border-white/55 bg-white/80 p-4 shadow-[inset_0_0_0_1px_rgba(200,216,226,0.55)]">
                <div class="h-4 w-32 rounded-full bg-[#d7e6ef]" />
                <div class="mt-4 grid grid-cols-3 gap-2">
                  <div class="h-14 rounded-xl bg-[#e7f2f8]" />
                  <div class="h-14 rounded-xl bg-[#e7f2f8]" />
                  <div class="h-14 rounded-xl bg-[#e7f2f8]" />
                </div>
                <div class="mt-3 h-24 rounded-2xl bg-[#e7f2f8]" />
                <div class="mt-3 h-20 rounded-2xl bg-[#e7f2f8]" />
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="hasCards"
          class="pointer-events-none absolute inset-0 z-10"
          aria-hidden="true"
        >
          <article
            v-for="(card, index) in sortedCards"
            :key="card.id"
            class="floating-chip absolute rounded-2xl border border-white/75 bg-white/78 p-3.5 shadow-[0_18px_42px_rgba(12,33,45,0.14)] backdrop-blur-xl sm:w-[12.5rem] sm:p-4"
            :class="[cardPlacementClass(index), cardMotionClass(index)]"
          >
            <div class="mb-2 flex items-center gap-2.5">
              <span class="grid h-8 w-8 place-items-center rounded-full bg-[#d8f8ea] text-[#006c4f]">
                <AppIcon :icon-key="card.iconKey" class="h-5 w-5" />
              </span>
              <p class="line-clamp-3 text-[0.88rem] font-semibold leading-5 text-[#001c2a]">{{ card.title }}</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-wrap {
  background: #f0f4f8;
}

.hero-main-title {
  font-size: clamp(2.9rem, 4.8vw, 4.85rem);
  line-height: 1.06;
  letter-spacing: -0.04em;
  font-weight: 800;
}

.hero-cta {
  background: #001c2a;
}

.hero-cta:hover {
  background: #006c4f;
}

.hero-cta:focus-visible {
  outline: 2px solid #67fcc6;
  outline-offset: 3px;
}

.floating-chip {
  position: absolute;
  pointer-events: auto;
  width: 11.2rem;
  border: 1px solid #d8e0e6;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 16px 28px rgba(0, 28, 42, 0.12);
}

.card-top-right {
  right: -2rem;
  top: -1.6rem;
}

.card-bottom-left {
  bottom: -1.2rem;
  left: -1.8rem;
}

.card-bottom-right {
  right: -1.3rem;
  bottom: 3rem;
}

.card-top-left {
  left: -1.4rem;
  top: 2.8rem;
}

.float-slow {
  animation: floatSlow 6s ease-in-out infinite;
}

.float-mid {
  animation: floatMid 5.2s ease-in-out infinite;
}

@keyframes floatSlow {
  0%,
  100% { transform: translateY(-2px); }
  50% { transform: translateY(8px); }
}

@keyframes floatMid {
  0%,
  100% { transform: translateY(1px); }
  50% { transform: translateY(7px); }
}

@media (max-width: 1023px) {
  .card-top-right {
    right: -0.4rem;
    top: -0.4rem;
  }

  .card-bottom-left {
    left: -0.4rem;
    bottom: -0.3rem;
  }

  .card-bottom-right {
    right: -0.2rem;
    bottom: 2rem;
  }
}

@media (max-width: 540px) {
  .card-bottom-right {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .float-slow,
  .float-mid {
    animation: none !important;
    transform: none !important;
  }
}
</style>
