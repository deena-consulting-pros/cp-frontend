<script setup lang="ts">
import type { HomepageData } from '~/types/homepage'

type WhyChooseHeading = HomepageData['whyChooseHeading']
type WhyChooseCard = HomepageData['whyChooseCards'][number]
type WhyChooseImage = HomepageData['whyChooseImage']
type WhyChooseBackgroundImage = HomepageData['whyChooseBackgroundImage']

const props = withDefaults(defineProps<{
  heading?: WhyChooseHeading
  cards?: WhyChooseCard[]
  image?: WhyChooseImage
  backgroundImage?: WhyChooseBackgroundImage
}>(), {
  heading: () => ({
    label: '',
    title: '',
    subtitle: '',
    highlightText: '',
    alignment: 'left'
  }),
  cards: () => [],
  image: () => ({ url: '', alt: '' }),
  backgroundImage: () => ({ url: '', alt: '' })
})

const { resolveImageUrl } = useStrapi()

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const sortedCards = computed(() => [...(props.cards || [])].sort((a, b) => a.order - b.order))

const hasContent = computed(() => Boolean(
  props.heading?.title
  || props.heading?.subtitle
  || sortedCards.value.length
  || props.image?.url
))

const imageAlt = computed(() => props.image?.alt || props.heading?.title || 'Why businesses choose Consulting Pros')
const backgroundImageUrl = computed(() => {
  const source = props.backgroundImage as {
    url?: string
    formats?: { large?: { url?: string }, medium?: { url?: string } }
    data?: {
      attributes?: {
        url?: string
        formats?: { large?: { url?: string }, medium?: { url?: string } }
      }
      url?: string
    }
  } | string | null | undefined

  if (typeof source === 'string') {
    return resolveImageUrl(source)
  }

  const rawUrl = source?.formats?.large?.url
    || source?.data?.attributes?.formats?.large?.url
    || source?.formats?.medium?.url
    || source?.data?.attributes?.formats?.medium?.url
    || source?.url
    || source?.data?.attributes?.url
    || source?.data?.url
    || ''

  return resolveImageUrl(rawUrl)
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
  }, { threshold: 0.3, rootMargin: '0px 0px -10% 0px' })

  if (sectionRef.value) observer.observe(sectionRef.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    v-if="hasContent"
    ref="sectionRef"
    class="why-choose-section relative w-full overflow-hidden bg-[#001c2a] py-16 md:py-24 lg:py-28"
    aria-labelledby="why-choose-title"
  >
    <div class="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
      <div
        v-if="backgroundImageUrl"
        class="why-choose-parallax-bg absolute inset-0 bg-cover bg-center opacity-30"
        :style="{ backgroundImage: `url(${backgroundImageUrl})` }"
      />
      <div class="absolute inset-0 bg-[#001c2a]/55" />
      <div class="absolute inset-0 bg-gradient-to-r from-[#001c2a]/95 via-[#001c2a]/78 to-[#001c2a]/58" />
      <div class="absolute inset-0 bg-gradient-to-b from-[#001c2a]/20 via-transparent to-[#001c2a]/35" />
      <div class="why-choose-pattern-bg absolute inset-0" />
      <div class="absolute inset-0 bg-[radial-gradient(80%_70%_at_90%_15%,rgba(32,178,170,0.16),rgba(0,0,0,0))]" />
      <div class="absolute inset-0 bg-[radial-gradient(75%_85%_at_8%_82%,rgba(22,78,99,0.24),rgba(0,0,0,0))]" />
    </div>

    <div class="relative z-10 mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div class="grid w-full grid-cols-1 items-start gap-12 md:gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(400px,560px)] lg:items-center lg:gap-12 xl:gap-14">
        <div>
          <SectionHeading
            id="why-choose-title"
            :heading="heading"
            alignment="left"
            dark
            title-color="#ffffff"
            label-color="#8fd5c0"
            subtitle-color="#cbd5e1"
            :visible="isVisible"
            reveal-class="why-reveal-left"
            title-class="text-[clamp(2rem,3.4vw,3.1rem)] leading-[1.13]"
            subtitle-class="max-w-[36rem] text-[clamp(1rem,1.05vw,1.125rem)] leading-[1.72]"
            label-class="text-xs tracking-[0.16em]"
          />

          <ul v-if="sortedCards.length" class="mt-9 space-y-4">
            <li
              v-for="(card, index) in sortedCards"
              :key="card.id"
              class="feature-item rounded-2xl border border-white/8 bg-white/3 p-4 md:p-5"
              :class="{ 'is-visible': isVisible }"
              :style="{ '--delay': `${index * 90}ms` }"
            >
              <div class="flex items-start gap-4">
                <span class="icon-circle mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#67fcc6] transition-colors duration-300">
                  <AppIcon :icon-key="card.iconKey" :title="card.title" class="h-5 w-5" />
                </span>
                <div>
                  <h3 class="text-lg font-semibold leading-snug text-white">
                    {{ card.title }}
                  </h3>
                  <p v-if="card.description" class="mt-1.5 text-sm leading-relaxed text-slate-300">
                    {{ card.description }}
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div class="why-reveal-right w-full max-w-[560px] lg:justify-self-end" :class="{ 'is-visible': isVisible }">
          <div class="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_28px_60px_rgba(0,0,0,0.28)] backdrop-blur-md md:p-8">
            <div class="aspect-[1.08/1] w-full overflow-hidden rounded-2xl">
              <img
                v-if="image?.url"
                :src="image.url"
                :alt="imageAlt"
                class="why-image h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              >
              <div
                v-else
                class="h-full w-full rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.why-choose-parallax-bg {
  background-size: cover;
  background-position: center;
}

.why-choose-pattern-bg {
  background-image:
    linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, transparent 60%),
    radial-gradient(circle at 16% 18%, rgba(103, 252, 198, 0.09), transparent 42%),
    radial-gradient(circle at 84% 72%, rgba(56, 189, 248, 0.08), transparent 48%);
}

.why-reveal-left,
.why-reveal-right,
.feature-item {
  opacity: 0;
  transform: translateY(24px);
}

.why-reveal-left.is-visible {
  animation: whyFadeUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.why-reveal-right.is-visible {
  animation: whyFadeUp 0.75s cubic-bezier(0.22, 1, 0.36, 1) 120ms both;
}

.feature-item.is-visible {
  animation: whyFadeUp 0.65s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0ms) both;
}

.feature-item {
  transition: border-color 0.3s ease, background-color 0.3s ease, transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-3px);
  border-color: rgba(103, 252, 198, 0.36);
  background-color: rgba(255, 255, 255, 0.07);
}

.feature-item:hover .icon-circle {
  background-color: #006c4f;
  color: #d8f8ea;
}

.why-image {
  filter: grayscale(0.98);
  transition: filter 0.45s ease, transform 0.45s ease;
}

.why-reveal-right:hover .why-image {
  filter: grayscale(0.12);
  transform: scale(1.01);
}

@keyframes whyFadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 1024px) {
  .why-choose-parallax-bg {
    background-attachment: fixed;
  }
}

@media (max-width: 1023px) {
  .why-choose-parallax-bg {
    background-attachment: scroll;
    transform: scale(1.03);
  }
}

@media (prefers-reduced-motion: reduce) {
  .why-choose-parallax-bg {
    background-attachment: scroll;
    transform: none;
  }

  .why-reveal-left,
  .why-reveal-right,
  .feature-item {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none;
  }

  .why-image {
    filter: grayscale(0);
    transition: none;
  }

  .feature-item:hover,
  .why-reveal-right:hover .why-image {
    transform: none;
  }
}
</style>
