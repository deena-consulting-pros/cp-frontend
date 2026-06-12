<script setup lang="ts">
import type { HomepageData } from '~/types/homepage'
import { HERO_ICON_DEFS, resolveHeroIcon } from '~/utils/iconMap'

type HeroCard = HomepageData['heroFloatingCards'][number]

const props = defineProps<{
  hero: HomepageData['hero']
  heroCards?: HeroCard[]
}>()

const prefersReducedMotion = ref(false)
const isDesktopParallax = ref(false)
const pointer = reactive({ x: 0, y: 0 })
const pointerTarget = reactive({ x: 0, y: 0 })
const motionQuery = ref<MediaQueryList | null>(null)
const pointerRaf = ref<number | null>(null)

const setReducedMotion = (query?: MediaQueryList | null) => {
  prefersReducedMotion.value = Boolean(query?.matches)
}

const onMotionChange = () => setReducedMotion(motionQuery.value)

const updateViewportFlags = () => {
  if (!import.meta.client) {
    return
  }
  isDesktopParallax.value = window.innerWidth >= 1024
}

const onMouseMove = (event: MouseEvent) => {
  if (prefersReducedMotion.value || !isDesktopParallax.value) {
    return
  }

  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  pointerTarget.x = (event.clientX - centerX) / centerX
  pointerTarget.y = (event.clientY - centerY) / centerY

  if (pointerRaf.value !== null) {
    return
  }

  pointerRaf.value = window.requestAnimationFrame(() => {
    pointer.x = pointerTarget.x
    pointer.y = pointerTarget.y
    pointerRaf.value = null
  })
}

onMounted(() => {
  updateViewportFlags()
  motionQuery.value = window.matchMedia('(prefers-reduced-motion: reduce)')
  setReducedMotion(motionQuery.value)

  window.addEventListener('resize', updateViewportFlags)
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  if ('addEventListener' in motionQuery.value) {
    motionQuery.value.addEventListener('change', onMotionChange)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewportFlags)
  window.removeEventListener('mousemove', onMouseMove)
  if (pointerRaf.value !== null) {
    window.cancelAnimationFrame(pointerRaf.value)
    pointerRaf.value = null
  }
  if (motionQuery.value && 'removeEventListener' in motionQuery.value) {
    motionQuery.value.removeEventListener('change', onMotionChange)
  }
})

const hasHero = computed(() => Boolean(
  props.hero.title
  || props.hero.description
  || props.hero.heroImage
  || props.hero.primaryButtonText
  || props.hero.secondaryButtonText
))

const sortedHeroCards = computed(() => [...(props.heroCards || [])].sort((a, b) => a.order - b.order))
const hasCards = computed(() => sortedHeroCards.value.length > 0)

const dashboardImage = computed(() => props.hero.heroImage || props.hero.image || '')

const heroTitleParts = computed(() => {
  const title = props.hero.title || ''
  const highlight = props.hero.highlightText || ''
  if (!highlight || !title.includes(highlight)) {
    return { before: title, highlight: '', after: '' }
  }

  const idx = title.indexOf(highlight)
  return {
    before: title.slice(0, idx),
    highlight,
    after: title.slice(idx + highlight.length)
  }
})

const parallaxStyle = (xDepth: number, yDepth: number) => {
  if (prefersReducedMotion.value || !isDesktopParallax.value) {
    return {}
  }

  return {
    transform: `translate3d(${pointer.x * xDepth}px, ${pointer.y * yDepth}px, 0)`
  }
}

const glowMintStyle = computed(() => parallaxStyle(28, 18))
const glowNavyStyle = computed(() => parallaxStyle(-20, 16))
const dashboardParallaxStyle = computed(() => parallaxStyle(10, 8))

const cardIcon = (card: HeroCard) => HERO_ICON_DEFS[resolveHeroIcon(card.iconKey, card.cardType, card.title)]

const isPpcCard = (card: HeroCard) => {
  const type = card.cardType.toLowerCase()
  const title = card.title.toLowerCase()
  return type.includes('ppc') || type.includes('performance') || title.includes('ppc')
}

const cardProgress = (value: string) => {
  const match = value.match(/(\d{1,3})/)
  if (!match) {
    return 76
  }
  return Math.min(100, Math.max(65, Number(match[1])))
}

const cardPlacementClass = (index: number) => {
  if (index === 0) return 'card-top-right'
  if (index === 1) return 'card-bottom-left'
  if (index === 2) return 'card-bottom-right'
  return 'card-extra'
}

const cardMotionClass = (index: number) => {
  if (index === 0) return 'float-slow'
  if (index === 1) return 'meter-card'
  return index % 2 === 0 ? 'float-mid' : 'float-slow'
}

const extraCardStyle = (index: number) => {
  if (index < 3) {
    return {}
  }

  const extraIndex = index - 3
  const col = extraIndex % 2
  const row = Math.floor(extraIndex / 2)

  return {
    right: `${-1 + col * 11.6}rem`,
    bottom: `${1.2 + row * 6.8}rem`
  }
}

const progressStyle = (card: HeroCard) => ({
  '--progress-target': `${cardProgress(card.value)}%`
})
</script>

<template>
  <section v-if="hasHero" class="relative overflow-hidden bg-[#f0f4f8]" aria-labelledby="hero-title">
    <div class="pointer-events-none absolute inset-0 z-0">
      <div
        class="hero-glow-mint absolute -right-[5%] -top-[10%] h-[37.5rem] w-[37.5rem] rounded-full blur-[120px] opacity-75 md:h-[34rem] md:w-[34rem] md:opacity-100"
        style="background-color: rgba(103, 252, 198, 0.2);"
        :style="glowMintStyle"
      />
      <div
        class="hero-glow-navy absolute bottom-[-10%] left-[-5%] h-100 w-100 rounded-full blur-[100px] opacity-80 md:opacity-100"
        style="background-color: rgba(0, 28, 42, 0.05);"
        :style="glowNavyStyle"
      />
    </div>

    <div class="relative z-10 mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10 lg:pb-[7.6rem] lg:pt-[8.6rem]">
      <div class="hero-reveal-left">
        <p
          v-if="hero.eyebrowText"
          class="inline-flex items-center rounded-full border border-[#d7e3eb] bg-white/72 px-4 py-2 text-xs font-semibold uppercase tracking-[0.17em] text-[#26485d]"
        >
          {{ hero.eyebrowText }}
        </p>

        <h1
          id="hero-title"
          class="mt-6 max-w-[36.25rem] text-[clamp(3rem,4.4vw,4.5rem)] font-black leading-[1.05] tracking-[-0.045em] text-[#001c2a]"
        >
          <template v-if="heroTitleParts.highlight">
            {{ heroTitleParts.before }}<span class="text-[#006c4f]">{{ heroTitleParts.highlight }}</span>{{ heroTitleParts.after }}
          </template>
          <template v-else>
            {{ hero.title }}
          </template>
        </h1>

        <p v-if="hero.description" class="mt-7 max-w-[36rem] text-[clamp(1rem,1.1vw,1.125rem)] leading-[1.7] text-slate-700">
          {{ hero.description }}
        </p>

        <div class="mt-10 flex flex-wrap gap-4">
          <NuxtLink
            v-if="hero.primaryButtonText && hero.primaryButtonUrl"
            :to="hero.primaryButtonUrl"
            class="inline-flex items-center justify-center rounded-full bg-[#001c2a] px-8 py-4 text-base font-semibold text-white shadow-[0_14px_34px_rgba(0,28,42,0.28)] transition duration-300 hover:-translate-y-1 hover:bg-[#006c4f]"
          >
            {{ hero.primaryButtonText }}
          </NuxtLink>
          <NuxtLink
            v-if="hero.secondaryButtonText && hero.secondaryButtonUrl"
            :to="hero.secondaryButtonUrl"
            class="inline-flex items-center justify-center rounded-full border border-[#d4dfe7] bg-white px-8 py-4 text-base font-semibold text-[#001c2a] shadow-[0_10px_24px_rgba(8,26,39,0.09)] transition duration-300 hover:-translate-y-1 hover:border-[#006c4f] hover:text-[#006c4f]"
          >
            {{ hero.secondaryButtonText }}
          </NuxtLink>
        </div>
      </div>

      <div class="hero-reveal-right relative mx-auto mt-12 w-full max-w-[34rem] lg:mt-0 lg:mx-auto" :style="dashboardParallaxStyle">
        <div class="hero-dashboard relative h-[21.2rem] w-full rounded-[2rem] border border-white/55 bg-[rgba(255,255,255,0.62)] p-4 shadow-[0_34px_80px_rgba(8,26,39,0.16)] backdrop-blur-[20px] sm:h-[23rem] sm:p-5 lg:h-[27rem] lg:p-6">
          <div class="mb-4 flex items-center justify-between border-b border-white/65 pb-3.5">
            <div class="flex items-center gap-2.5">
              <span class="h-3 w-3 rounded-full bg-[#eb6b6b]" />
              <span class="h-3 w-3 rounded-full bg-[#e8c756]" />
              <span class="h-3 w-3 rounded-full bg-[#79d184]" />
            </div>
            <p class="whitespace-nowrap text-[0.6rem] font-extrabold tracking-[0.18em] text-slate-500 sm:text-[0.64rem]">MARKETING DASHBOARD v4.0</p>
          </div>
          <div class="relative h-[calc(100%-3.3rem)] overflow-hidden rounded-[1.45rem] border border-white/40 bg-[linear-gradient(160deg,#e9f7f1,#ddebf4)] p-2.5 sm:p-3">
            <img
              v-if="dashboardImage"
              :src="dashboardImage"
              :alt="hero.title || 'Consulting Pros dashboard'"
              class="h-full w-full rounded-[1.1rem] object-cover object-center"
              loading="eager"
              decoding="async"
            >
            <div
              v-if="dashboardImage"
              class="pointer-events-none absolute inset-x-[0.65rem] bottom-[0.65rem] z-[1] h-[42%] rounded-b-[1.1rem] bg-[linear-gradient(to_top,rgba(92,230,167,0.38),rgba(92,230,167,0.14)_46%,rgba(92,230,167,0))]"
            />
            <div
              v-else
              class="fallback-board h-full w-full rounded-[1.1rem] border border-white/55 bg-[linear-gradient(145deg,#f5fbf8,#e8f2f7)] p-4"
            >
              <div class="mb-3 h-5 w-1/3 rounded-full bg-[#d4e7de]" />
              <div class="grid grid-cols-3 gap-2.5">
                <div class="h-16 rounded-xl bg-white/78 shadow-[inset_0_0_0_1px_rgba(200,216,226,0.65)]" />
                <div class="h-16 rounded-xl bg-white/78 shadow-[inset_0_0_0_1px_rgba(200,216,226,0.65)]" />
                <div class="h-16 rounded-xl bg-white/78 shadow-[inset_0_0_0_1px_rgba(200,216,226,0.65)]" />
              </div>
              <div class="mt-3 h-28 rounded-2xl bg-white/80 shadow-[inset_0_0_0_1px_rgba(200,216,226,0.65)]" />
              <div class="mt-3 h-20 rounded-2xl bg-white/80 shadow-[inset_0_0_0_1px_rgba(200,216,226,0.65)]" />
            </div>
          </div>
        </div>

        <div v-if="hasCards" class="pointer-events-none absolute inset-0 z-10 overflow-visible">
          <article
            v-for="(card, index) in sortedHeroCards"
            :key="card.id"
            class="hero-float-card pointer-events-auto absolute w-[11.2rem] rounded-2xl border border-white/75 bg-white/76 p-3.5 shadow-[0_18px_42px_rgba(12,33,45,0.14)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 sm:w-[12.3rem] sm:p-4 lg:w-[13rem]"
            :class="[
              cardPlacementClass(index),
              cardMotionClass(index),
              index > 2 ? 'hidden lg:block' : ''
            ]"
            :style="extraCardStyle(index)"
          >
            <div class="mb-2 flex items-center gap-2.5">
              <span class="grid h-8 w-8 place-items-center rounded-full bg-[#d8f8ea] text-[#006c4f]">
                <svg
                  :viewBox="cardIcon(card).viewBox"
                  class="h-5 w-5"
                  :fill="cardIcon(card).renderMode === 'stroke' ? 'none' : 'currentColor'"
                  :stroke="cardIcon(card).renderMode === 'stroke' ? 'currentColor' : 'none'"
                  :stroke-width="cardIcon(card).renderMode === 'stroke' ? (cardIcon(card).strokeWidth || 1.75) : 0"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path v-for="path in cardIcon(card).paths" :key="path" :d="path" />
                </svg>
              </span>
              <p class="text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-slate-500">{{ card.title }}</p>
            </div>

            <p v-if="card.value" class="text-[1.56rem] font-extrabold leading-none text-[#001c2a]">{{ card.value }}</p>
            <p v-if="card.description" class="mt-1 text-xs leading-relaxed text-[#566168]">{{ card.description }}</p>

            <div v-if="isPpcCard(card)" class="mt-2.5">
              <div class="h-1.5 w-full rounded-full bg-[#d9eee6]">
                <div
                  class="hero-progress hero-progress-fill h-full rounded-full bg-[linear-gradient(90deg,#006c4f,#67fcc6)]"
                  :style="progressStyle(card)"
                />
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-reveal-left {
  animation: heroFadeUp 0.78s ease-out both;
}

.hero-reveal-right {
  animation: heroFadeUp 0.82s ease-out 0.2s both;
  will-change: transform;
}

.card-top-right {
  right: -2.8rem;
  top: -2.2rem;
}

.card-bottom-left {
  bottom: -1.8rem;
  left: -2.2rem;
}

.card-bottom-right {
  bottom: 2.8rem;
  right: -1.4rem;
}

.card-extra {
  right: 0;
  bottom: 1rem;
}

.bounce-impact {
  animation: bounceImpact 4.6s cubic-bezier(0.2, 0.65, 0.24, 1) infinite;
  will-change: transform;
}

.float-slow {
  animation: floatSlow 5s ease-in-out infinite;
  will-change: transform;
}

.float-mid {
  animation: floatMid 5.6s ease-in-out infinite;
  will-change: transform;
}

.pulse-soft {
  animation: pulseSoft 4s ease-in-out infinite;
  will-change: transform, box-shadow;
}

.hero-progress {
  background-size: 200% 100%;
}

.hero-progress-fill {
  width: var(--progress-target);
}

@keyframes heroFadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceImpact {
  0% { transform: translateY(-28px) scale(0.995); }
  18% { transform: translateY(12px) scale(0.986); }
  28% { transform: translateY(-10px) scale(1); }
  36% { transform: translateY(6px) scale(0.995); }
  44% { transform: translateY(-3px); }
  52% { transform: translateY(1px); }
  58% { transform: translateY(0); }
  100% { transform: translateY(0); }
}

@keyframes floatSlow {
  0%,
  100% { transform: translateY(-2px); }
  50% { transform: translateY(8px); }
}

@keyframes floatMid {
  0%,
  100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

@keyframes pulseSoft {
  0%,
  100% {
    transform: translateY(0);
    box-shadow: 0 18px 42px rgba(12, 33, 45, 0.14);
  }
  50% {
    transform: translateY(-4px);
    box-shadow: 0 24px 50px rgba(12, 33, 45, 0.19);
  }
}

@keyframes progressShimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

@media (max-width: 1023px) {
  .card-top-right {
    right: -0.3rem;
    top: -0.55rem;
  }

  .card-bottom-left {
    bottom: -0.5rem;
    left: -0.45rem;
  }

  .card-bottom-right {
    right: -0.4rem;
  }
}

@media (max-width: 640px) {
  .hero-glow-mint {
    width: 24rem;
    height: 24rem;
    opacity: 0.52;
  }

  .hero-glow-navy {
    width: 16rem;
    height: 16rem;
    opacity: 0.45;
  }

  .card-top-right,
  .card-bottom-left {
    width: 10.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-reveal-left,
  .hero-reveal-right,
  .bounce-impact,
  .float-slow,
  .float-mid,
  .pulse-soft,
  .hero-progress {
    animation: none !important;
  }
}
</style>
