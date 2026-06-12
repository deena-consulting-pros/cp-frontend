<script setup lang="ts">
import type { ServicesPageData } from '~/types/services'

type ServicesHero = ServicesPageData['hero']
type ServicesHeroCard = ServicesPageData['heroFloatingCards'][number]

const props = withDefaults(defineProps<{
  hero: ServicesHero
  cards?: ServicesHeroCard[]
}>(), {
  cards: () => []
})

const { resolveImageUrl } = useStrapi()

const hasHero = computed(() => Boolean(
  props.hero?.title
  || props.hero?.description
  || props.hero?.heroImage
  || props.hero?.primaryButtonText
  || props.hero?.secondaryButtonText
))

const sortedCards = computed(() => [...(props.cards || [])].sort((a, b) => (a.order || 0) - (b.order || 0)))
const hasCards = computed(() => sortedCards.value.length > 0)
const heroImageUrl = computed(() => resolveImageUrl(props.hero?.heroImage))
const backgroundImageUrl = computed(() => resolveImageUrl(props.hero?.backgroundImage))

const heroTitleParts = computed(() => {
  const title = props.hero?.title || ''
  const highlight = props.hero?.highlightText || ''

  if (!highlight || !title.includes(highlight)) {
    return { before: title, highlight: '', after: '' }
  }

  const index = title.indexOf(highlight)
  return {
    before: title.slice(0, index),
    highlight,
    after: title.slice(index + highlight.length)
  }
})

const isExternalUrl = (url: string) => /^(https?:)?\/\//i.test(url) || url.startsWith('mailto:') || url.startsWith('tel:')
const isInternalUrl = (url: string) => Boolean(url) && !isExternalUrl(url)
const shouldUseAnchor = (url: string, newTab?: boolean) => Boolean(newTab) || isExternalUrl(url)

const cardPlacementClass = (index: number) => {
  if (index === 0) return 'card-top-right'
  if (index === 1) return 'card-bottom-left'
  if (index === 2) return 'card-bottom-right'
  return 'card-top-left'
}

const cardMotionClass = (index: number) => (index % 2 === 0 ? 'float-slow' : 'float-mid')
</script>

<template>
  <SectionShell
    v-if="hasHero"
    as="section"
    background="light"
    container="normal"
    section-class="relative overflow-x-clip overflow-y-visible py-18 md:py-24 lg:py-28"
    container-class="relative z-10 lg:px-10"
    aria-labelledby="services-hero-title"
  >
    <div class="pointer-events-none absolute inset-0 z-0">
      <div
        class="absolute -right-[8%] top-[4%] h-[30rem] w-[30rem] rounded-full blur-[120px] md:h-[34rem] md:w-[34rem]"
        style="background-color: rgba(103, 252, 198, 0.2);"
      />
      <div
        class="absolute -bottom-[16%] -left-[6%] h-[22rem] w-[22rem] rounded-full blur-[100px] md:h-[28rem] md:w-[28rem]"
        style="background-color: rgba(0, 28, 42, 0.08);"
      />
      <img
        v-if="backgroundImageUrl"
        :src="backgroundImageUrl"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 h-full w-full object-cover opacity-[0.08] mix-blend-multiply"
        loading="lazy"
        decoding="async"
      >
    </div>

    <div class="relative grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div class="services-hero-reveal">
        <p
          v-if="hero.eyebrowText"
          class="inline-flex items-center rounded-full border border-[#d6e1e8] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#26485d]"
        >
          {{ hero.eyebrowText }}
        </p>

        <h1
          id="services-hero-title"
          class="mt-6 max-w-[39rem] font-display text-[clamp(2.75rem,4.5vw,4.75rem)] leading-[1.08] font-black tracking-[-0.045em] text-[#001c2a]"
        >
          <template v-if="heroTitleParts.highlight">
            {{ heroTitleParts.before }}<span class="text-[#006c4f]">{{ heroTitleParts.highlight }}</span>{{ heroTitleParts.after }}
          </template>
          <template v-else>
            {{ hero.title }}
          </template>
        </h1>

        <p v-if="hero.description" class="mt-7 max-w-[36rem] text-[clamp(1rem,1.1vw,1.125rem)] leading-[1.72] text-slate-700">
          {{ hero.description }}
        </p>

        <div class="mt-10 flex flex-wrap gap-4">
          <NuxtLink
            v-if="hero.primaryButtonText && hero.primaryButtonUrl && !shouldUseAnchor(hero.primaryButtonUrl, hero.primaryButtonNewTab) && isInternalUrl(hero.primaryButtonUrl)"
            :to="hero.primaryButtonUrl"
            class="inline-flex items-center justify-center rounded-full bg-[#001c2a] px-8 py-4 text-base font-semibold text-white shadow-[0_14px_34px_rgba(0,28,42,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-[#006c4f] hover:shadow-[0_18px_38px_rgba(0,108,79,0.28)] motion-reduce:transition-none"
          >
            {{ hero.primaryButtonText }}
          </NuxtLink>
          <a
            v-else-if="hero.primaryButtonText && hero.primaryButtonUrl"
            :href="hero.primaryButtonUrl"
            class="inline-flex items-center justify-center rounded-full bg-[#001c2a] px-8 py-4 text-base font-semibold text-white shadow-[0_14px_34px_rgba(0,28,42,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-[#006c4f] hover:shadow-[0_18px_38px_rgba(0,108,79,0.28)] motion-reduce:transition-none"
            :target="hero.primaryButtonNewTab ? '_blank' : undefined"
            :rel="hero.primaryButtonNewTab ? 'noopener noreferrer' : undefined"
          >
            {{ hero.primaryButtonText }}
          </a>

          <NuxtLink
            v-if="hero.secondaryButtonText && hero.secondaryButtonUrl && !shouldUseAnchor(hero.secondaryButtonUrl, hero.secondaryButtonNewTab) && isInternalUrl(hero.secondaryButtonUrl)"
            :to="hero.secondaryButtonUrl"
            class="inline-flex items-center justify-center rounded-full border border-[#d4dfe7] bg-white/92 px-8 py-4 text-base font-semibold text-[#001c2a] shadow-[0_10px_24px_rgba(8,26,39,0.09)] transition duration-300 hover:-translate-y-1 hover:border-[#006c4f] hover:bg-[#f2fdf8] hover:text-[#006c4f] motion-reduce:transition-none"
          >
            {{ hero.secondaryButtonText }}
          </NuxtLink>
          <a
            v-else-if="hero.secondaryButtonText && hero.secondaryButtonUrl"
            :href="hero.secondaryButtonUrl"
            class="inline-flex items-center justify-center rounded-full border border-[#d4dfe7] bg-white/92 px-8 py-4 text-base font-semibold text-[#001c2a] shadow-[0_10px_24px_rgba(8,26,39,0.09)] transition duration-300 hover:-translate-y-1 hover:border-[#006c4f] hover:bg-[#f2fdf8] hover:text-[#006c4f] motion-reduce:transition-none"
            :target="hero.secondaryButtonNewTab ? '_blank' : undefined"
            :rel="hero.secondaryButtonNewTab ? 'noopener noreferrer' : undefined"
          >
            {{ hero.secondaryButtonText }}
          </a>
        </div>
      </div>

      <div class="services-hero-reveal-right relative mx-auto mt-2 w-full max-w-[37rem] lg:mt-0">
        <div class="services-hero-image-card relative w-full overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-4 shadow-[0_34px_80px_rgba(8,26,39,0.16)] backdrop-blur-[14px] transition duration-300 motion-reduce:transition-none sm:p-5">
          <div class="relative h-[21rem] overflow-hidden rounded-[1.35rem] bg-[linear-gradient(155deg,#ebf7f0,#dce9f4)] sm:h-[25rem] lg:h-[29rem]">
            <img
              v-if="heroImageUrl"
              :src="heroImageUrl"
              :alt="hero.title || 'Consulting Pros services'"
              class="h-full w-full object-cover object-center transition duration-500 hover:scale-[1.02] motion-reduce:transition-none"
              loading="lazy"
              decoding="async"
            >
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
            class="absolute w-[11.2rem] rounded-2xl border border-white/75 bg-white/78 p-3.5 shadow-[0_18px_42px_rgba(12,33,45,0.14)] backdrop-blur-xl sm:w-[12.5rem] sm:p-4"
            :class="[cardPlacementClass(index), cardMotionClass(index), index > 3 ? 'hidden lg:block' : '']"
          >
            <div class="mb-2 flex items-center gap-2.5">
              <span class="grid h-8 w-8 place-items-center rounded-full bg-[#d8f8ea] text-[#006c4f]">
                <AppIcon :icon-key="card.iconKey" :title="card.title" :card-type="card.cardType" class="h-5 w-5" />
              </span>
              <p class="line-clamp-2 text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-slate-500">{{ card.title }}</p>
            </div>
            <p v-if="card.value" class="text-[1.45rem] font-extrabold leading-none text-[#001c2a]">{{ card.value }}</p>
            <p v-if="card.description" class="mt-1 text-xs leading-relaxed text-[#566168]">{{ card.description }}</p>
          </article>
        </div>
      </div>
    </div>
  </SectionShell>
</template>

<style scoped>
.services-hero-reveal {
  animation: heroFadeUp 0.78s ease-out both;
}

.services-hero-reveal-right {
  animation: heroFadeUp 0.82s ease-out 0.16s both;
}

.services-hero-image-card {
  transition: transform 0.34s ease, box-shadow 0.34s ease;
}

.services-hero-image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 40px 88px rgba(8, 26, 39, 0.2);
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

@keyframes heroFadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

  .card-top-left {
    left: -0.3rem;
    top: 1.6rem;
  }
}

@media (max-width: 767px) {
  .card-top-left {
    display: none;
  }
}

@media (max-width: 540px) {
  .card-bottom-right {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .services-hero-reveal,
  .services-hero-reveal-right,
  .float-slow,
  .float-mid {
    animation: none !important;
    transform: none !important;
  }

  .services-hero-image-card {
    transition: none;
  }

  .services-hero-image-card:hover {
    transform: none;
    box-shadow: 0 34px 80px rgba(8, 26, 39, 0.16);
  }
}
</style>
