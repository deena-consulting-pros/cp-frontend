<script setup lang="ts">
import type { HomepageData } from '~/types/homepage'

type TrustedHeading = HomepageData['trustedHeading']
type TrustedLogo = HomepageData['trustedLogos'][number]

const props = withDefaults(defineProps<{
  heading?: TrustedHeading
  logos?: TrustedLogo[]
}>(), {
  heading: () => ({
    label: '',
    title: '',
    subtitle: '',
    highlightText: '',
    alignment: ''
  }),
  logos: () => []
})

const activeLogos = computed(() => {
  return [...props.logos]
    .filter((item) => item.isActive)
    .sort((a, b) => a.order - b.order)
})

const headingContent = computed(() => ({
  ...props.heading,
  label: props.heading?.label || 'TRUSTED BY INDUSTRY LEADERS'
}))

const hasItems = computed(() => activeLogos.value.length > 0)
const marqueeItems = computed(() => [...activeLogos.value, ...activeLogos.value])

const shouldOpenNewTab = (url: string) => /^https?:\/\//i.test(url)
const hasClickableUrl = (url: string) => Boolean(url && url !== '#')
</script>

<template>
  <section
    v-if="hasItems"
    class="trusted-marquee relative overflow-hidden border-y border-slate-200/80 bg-white py-16"
    aria-label="Trusted companies"
  >
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
      <SectionHeading
        :heading="headingContent"
        :visible="true"
        max-width="max-w-none"
        label-class="text-center text-xs font-bold tracking-[0.24em] text-slate-400 !mb-0"
      />
    </div>

    <div class="trusted-mask relative mt-10 overflow-hidden">
      <div class="marquee-track flex w-max items-center gap-12 md:gap-20">
        <template v-for="(item, index) in marqueeItems" :key="`${item.id}-${index}`">
          <NuxtLink
            v-if="hasClickableUrl(item.url)"
            :to="item.url"
            class="marquee-item mx-6 inline-flex h-20 w-[280px] shrink-0 items-center justify-center rounded-2xl px-6 py-4 text-3xl font-extrabold uppercase leading-none tracking-[0.08em] text-slate-300/90 transition-[background-color,transform] duration-300 hover:bg-slate-100 md:mx-8 md:w-[320px]"
            :target="shouldOpenNewTab(item.url) ? '_blank' : undefined"
            :rel="shouldOpenNewTab(item.url) ? 'noopener noreferrer' : undefined"
          >
            <img
              v-if="item.logo"
              :src="item.logo"
              :alt="item.name || 'Trusted logo'"
              :width="item.logoWidth || 260"
              :height="item.logoHeight || 48"
              class="trusted-logo max-h-12 max-w-[220px] w-full object-contain transition-[filter,opacity,transform] duration-300 md:max-h-14 md:max-w-[260px]"
              loading="lazy"
              decoding="async"
            >
            <span v-else>{{ item.name }}</span>
          </NuxtLink>

          <div
            v-else
            class="marquee-item mx-6 inline-flex h-20 w-[280px] shrink-0 items-center justify-center rounded-2xl px-6 py-4 text-3xl font-extrabold uppercase leading-none tracking-[0.08em] text-slate-300/90 transition-[background-color,transform] duration-300 hover:bg-slate-100 md:mx-8 md:w-[320px]"
          >
            <img
              v-if="item.logo"
              :src="item.logo"
              :alt="item.name || 'Trusted logo'"
              :width="item.logoWidth || 260"
              :height="item.logoHeight || 48"
              class="trusted-logo max-h-12 max-w-[220px] w-full object-contain transition-[filter,opacity,transform] duration-300 md:max-h-14 md:max-w-[260px]"
              loading="lazy"
              decoding="async"
            >
            <span v-else>{{ item.name }}</span>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.trusted-marquee {
  isolation: isolate;
}

.trusted-mask::before,
.trusted-mask::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: clamp(3rem, 8vw, 7rem);
  z-index: 2;
  pointer-events: none;
}

.trusted-mask::before {
  left: 0;
  background: linear-gradient(to right, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
}

.trusted-mask::after {
  right: 0;
  background: linear-gradient(to left, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
}

.marquee-track {
  animation: trusted-marquee 35s linear infinite;
  will-change: transform;
}

.trusted-logo {
  opacity: 0.72;
  filter: grayscale(1) contrast(1.05) brightness(0.72);
}

.marquee-item:hover .trusted-logo {
  opacity: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 28, 42, 0.22));
  transform: translateY(-1px);
}

.trusted-marquee:hover .marquee-track {
  animation-play-state: paused;
}

@keyframes trusted-marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (max-width: 768px) {
  .marquee-track .marquee-item {
    font-size: 1.65rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
    transform: none;
  }

  .trusted-mask {
    overflow-x: auto;
    scrollbar-width: thin;
  }
}
</style>
