<script setup lang="ts">
import type { AboutData } from '~/types/about'

type AboutHero = AboutData['hero']
type AboutHeroCard = AboutData['heroCards'][number]

const props = withDefaults(defineProps<{
  hero: AboutHero
  cards?: AboutHeroCard[]
  showHeroImage?: boolean
}>(), {
  cards: () => [],
  showHeroImage: true
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

const cardMotionClass = (index: number) => {
  if (index % 2 === 0) return 'float-slow'
  return 'float-mid'
}
</script>

<template>
  <section
    v-if="hasHero"
    class="relative overflow-x-clip overflow-y-visible bg-[#f0f4f8]"
    aria-labelledby="about-hero-title"
  >
    <div class="pointer-events-none absolute inset-0 z-0">
      <div
        class="absolute -right-[8%] top-[3%] h-[30rem] w-[30rem] rounded-full blur-[120px] md:h-[36rem] md:w-[36rem]"
        style="background-color: rgba(103, 252, 198, 0.22);"
      />
      <div
        class="absolute -bottom-[18%] -left-[6%] h-[22rem] w-[22rem] rounded-full blur-[100px] md:h-[28rem] md:w-[28rem]"
        style="background-color: rgba(0, 28, 42, 0.09);"
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

    <div
      class="relative z-10 mx-auto w-full max-w-[1280px] px-4 py-20 sm:px-6 lg:items-center lg:gap-16 lg:px-10 lg:py-28"
      :class="showHeroImage ? 'lg:grid lg:grid-cols-2' : ''"
    >
      <div class="about-hero-reveal-left">
        <p
          v-if="hero.eyebrowText"
          class="inline-flex items-center rounded-full border border-[#d6e1e8] bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#26485d]"
        >
          {{ hero.eyebrowText }}
        </p>

        <h1
          id="about-hero-title"
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
            class="inline-flex items-center justify-center rounded-full bg-[#001c2a] px-8 py-4 text-base font-semibold text-white shadow-[0_14px_34px_rgba(0,28,42,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-[#006c4f] hover:shadow-[0_18px_38px_rgba(0,108,79,0.28)]"
            :target="hero.primaryButtonNewTab ? '_blank' : undefined"
            :rel="hero.primaryButtonNewTab ? 'noopener noreferrer' : undefined"
          >
            {{ hero.primaryButtonText }}
          </NuxtLink>
          <a
            v-else-if="hero.primaryButtonText && hero.primaryButtonUrl"
            :href="hero.primaryButtonUrl"
            class="inline-flex items-center justify-center rounded-full bg-[#001c2a] px-8 py-4 text-base font-semibold text-white shadow-[0_14px_34px_rgba(0,28,42,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-[#006c4f] hover:shadow-[0_18px_38px_rgba(0,108,79,0.28)]"
            :target="hero.primaryButtonNewTab ? '_blank' : undefined"
            :rel="hero.primaryButtonNewTab ? 'noopener noreferrer' : undefined"
          >
            {{ hero.primaryButtonText }}
          </a>

          <NuxtLink
            v-if="hero.secondaryButtonText && hero.secondaryButtonUrl && !shouldUseAnchor(hero.secondaryButtonUrl, hero.secondaryButtonNewTab) && isInternalUrl(hero.secondaryButtonUrl)"
            :to="hero.secondaryButtonUrl"
            class="inline-flex items-center justify-center rounded-full border border-[#d4dfe7] bg-white/92 px-8 py-4 text-base font-semibold text-[#001c2a] shadow-[0_10px_24px_rgba(8,26,39,0.09)] transition duration-300 hover:-translate-y-1 hover:border-[#006c4f] hover:bg-[#f2fdf8] hover:text-[#006c4f]"
            :target="hero.secondaryButtonNewTab ? '_blank' : undefined"
            :rel="hero.secondaryButtonNewTab ? 'noopener noreferrer' : undefined"
          >
            {{ hero.secondaryButtonText }}
          </NuxtLink>
          <a
            v-else-if="hero.secondaryButtonText && hero.secondaryButtonUrl"
            :href="hero.secondaryButtonUrl"
            class="inline-flex items-center justify-center rounded-full border border-[#d4dfe7] bg-white/92 px-8 py-4 text-base font-semibold text-[#001c2a] shadow-[0_10px_24px_rgba(8,26,39,0.09)] transition duration-300 hover:-translate-y-1 hover:border-[#006c4f] hover:bg-[#f2fdf8] hover:text-[#006c4f]"
            :target="hero.secondaryButtonNewTab ? '_blank' : undefined"
            :rel="hero.secondaryButtonNewTab ? 'noopener noreferrer' : undefined"
          >
            {{ hero.secondaryButtonText }}
          </a>
        </div>
      </div>

      <div v-if="showHeroImage" class="about-hero-reveal-right relative mx-auto mt-12 w-full max-w-[37rem] lg:mt-0">
        <div class="about-hero-image-card relative w-full overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-4 shadow-[0_34px_80px_rgba(8,26,39,0.16)] backdrop-blur-[14px] sm:p-5">
          <div class="relative h-[21rem] overflow-hidden rounded-[1.35rem] bg-[linear-gradient(155deg,#ebf7f0,#dce9f4)] sm:h-[25rem] lg:h-[29rem]">
            <img
              v-if="heroImageUrl"
              :src="heroImageUrl"
              :alt="hero.title || 'About Consulting Pros FZC'"
              class="h-full w-full object-cover object-center transition duration-500 hover:scale-[1.02]"
              loading="lazy"
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
            class="about-float-card pointer-events-auto absolute w-[11.2rem] rounded-2xl border border-white/75 bg-white/72 p-3.5 shadow-[0_18px_42px_rgba(12,33,45,0.14)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 sm:w-[12.5rem] sm:p-4"
            :class="[cardPlacementClass(index), cardMotionClass(index)]"
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
  </section>
</template>

<style scoped>
.about-hero-reveal-left {
  animation: aboutFadeUp 0.78s ease-out both;
}

.about-hero-reveal-right {
  animation: aboutFadeUp 0.82s ease-out 0.16s both;
}

.about-hero-image-card {
  transition: transform 0.34s ease, box-shadow 0.34s ease;
}

.about-hero-image-card:hover {
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

@keyframes aboutFadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
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
  .about-float-card {
    width: 10rem;
    padding: 0.75rem;
  }

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
  .about-hero-reveal-left,
  .about-hero-reveal-right,
  .float-slow,
  .float-mid {
    animation: none !important;
    transform: none !important;
  }

  .about-hero-image-card {
    transition: none;
  }

  .about-hero-image-card:hover {
    transform: none;
    box-shadow: 0 34px 80px rgba(8, 26, 39, 0.16);
  }
}
</style>
