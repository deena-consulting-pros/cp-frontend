<script setup lang="ts">
import type { HomepageData } from '~/types/homepage'

type PortfolioHeading = HomepageData['portfolioHeading']
type PortfolioButton = HomepageData['portfolioButton']
type PortfolioItem = HomepageData['portfolioItems'][number]

const props = withDefaults(defineProps<{
  heading?: PortfolioHeading
  items?: PortfolioItem[]
  button?: PortfolioButton
}>(), {
  heading: () => ({
    label: '',
    title: '',
    subtitle: '',
    highlightText: '',
    alignment: 'left'
  }),
  items: () => [],
  button: () => ({
    label: '',
    url: '',
    newTab: false
  })
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const visibleItems = computed(() => props.items || [])
const hasContent = computed(() => visibleItems.value.length > 0)

const buttonHref = computed(() => {
  const value = props.button?.url || ''
  if (!value) return '/portfolio'
  return value
})

const isExternalUrl = (url: string) => /^(https?:|mailto:|tel:)/i.test(url)
const isButtonExternal = computed(() => isExternalUrl(buttonHref.value))

const cardImage = (item: PortfolioItem) => item.thumbnail || item.featuredImage || ''
const cardHref = (item: PortfolioItem) => item.projectUrl || (item.slug ? `/portfolio/${item.slug}` : '/portfolio')
const cardIsExternal = (item: PortfolioItem) => isExternalUrl(cardHref(item))
const cardDelay = (index: number) => `${120 + index * 100}ms`

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
  }, { threshold: 0.22, rootMargin: '0px 0px -12% 0px' })

  if (sectionRef.value) observer.observe(sectionRef.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    v-if="hasContent"
    ref="sectionRef"
    aria-labelledby="portfolio-section-title"
  >
    <header class="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
      <SectionHeading
        id="portfolio-section-title"
        :heading="heading"
        alignment="left"
        max-width="max-w-[46rem]"
        reveal-class="portfolio-reveal"
        :visible="isVisible"
        :center-container="false"
        margin-bottom-class="mb-0"
      />

      <NuxtLink
        v-if="button?.label && !isButtonExternal"
        :to="buttonHref"
        class="portfolio-link portfolio-reveal inline-flex w-fit shrink-0 items-center border-b border-[#001c2a] pb-1 text-sm font-semibold uppercase tracking-[0.08em] text-[#001c2a]"
        :class="{ 'is-visible': isVisible }"
        :target="button?.newTab ? '_blank' : undefined"
        :rel="button?.newTab ? 'noopener noreferrer' : undefined"
      >
        {{ button.label }}
      </NuxtLink>
      <a
        v-else-if="button?.label"
        :href="buttonHref"
        class="portfolio-link portfolio-reveal inline-flex w-fit shrink-0 items-center border-b border-[#001c2a] pb-1 text-sm font-semibold uppercase tracking-[0.08em] text-[#001c2a]"
        :class="{ 'is-visible': isVisible }"
        :target="button?.newTab ? '_blank' : undefined"
        :rel="button?.newTab ? 'noopener noreferrer' : undefined"
      >
        {{ button.label }}
      </a>
    </header>

    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="(item, index) in visibleItems"
        :key="item.id"
        class="portfolio-card-reveal"
        :class="{ 'is-visible': isVisible }"
        :style="{ '--delay': cardDelay(index) }"
      >
        <NuxtLink
          v-if="!cardIsExternal(item)"
          :to="cardHref(item)"
          class="group block no-underline"
        >
          <div class="image-wrap mb-5 h-[20rem] overflow-hidden rounded-2xl bg-slate-100 shadow-[0_10px_28px_rgba(15,23,42,0.12)] sm:h-[22rem] lg:h-[24rem]">
            <img
              v-if="cardImage(item)"
              :src="cardImage(item)"
              :alt="item.title || 'Portfolio project'"
              class="portfolio-image h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            >
            <div v-else class="placeholder h-full w-full" aria-hidden="true" />
          </div>
          <p v-if="item.category" class="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#006c4f]">{{ item.category }}</p>
          <h3 class="mb-2 text-2xl font-bold leading-tight text-[#001c2a]">{{ item.title }}</h3>
          <p class="text-[0.98rem] leading-7 text-slate-600">{{ item.shortDescription }}</p>
        </NuxtLink>

        <a
          v-else
          :href="cardHref(item)"
          :target="item.projectUrl ? '_blank' : undefined"
          :rel="item.projectUrl ? 'noopener noreferrer' : undefined"
          class="group block no-underline"
        >
          <div class="image-wrap mb-5 h-[20rem] overflow-hidden rounded-2xl bg-slate-100 shadow-[0_10px_28px_rgba(15,23,42,0.12)] sm:h-[22rem] lg:h-[24rem]">
            <img
              v-if="cardImage(item)"
              :src="cardImage(item)"
              :alt="item.title || 'Portfolio project'"
              class="portfolio-image h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            >
            <div v-else class="placeholder h-full w-full" aria-hidden="true" />
          </div>
          <p v-if="item.category" class="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#006c4f]">{{ item.category }}</p>
          <h3 class="mb-2 text-2xl font-bold leading-tight text-[#001c2a]">{{ item.title }}</h3>
          <p class="text-[0.98rem] leading-7 text-slate-600">{{ item.shortDescription }}</p>
        </a>
      </article>
    </div>
  </div>
</template>

<style scoped>
.portfolio-reveal,
.portfolio-card-reveal {
  opacity: 0;
  transform: translateY(24px);
}

.portfolio-reveal.is-visible {
  animation: portfolioFadeUp 0.72s ease-out both;
}

.portfolio-card-reveal.is-visible {
  animation: portfolioFadeUp 0.72s ease-out var(--delay, 0ms) both;
}

.portfolio-image {
  transition: transform 0.75s ease;
  will-change: transform;
}

.group:hover .portfolio-image,
.group:focus-visible .portfolio-image {
  transform: scale(1.08);
}

.portfolio-link {
  transition: color 0.25s ease, border-color 0.25s ease;
}

.portfolio-link:hover,
.portfolio-link:focus-visible {
  color: #006c4f;
  border-color: #006c4f;
}

.placeholder {
  background: linear-gradient(140deg, #e2e8f0, #f1f5f9);
}

@keyframes portfolioFadeUp {
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
  .portfolio-reveal,
  .portfolio-card-reveal {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none !important;
  }

  .portfolio-image {
    transition: none;
  }

  .group:hover .portfolio-image,
  .group:focus-visible .portfolio-image {
    transform: none;
  }
}
</style>
