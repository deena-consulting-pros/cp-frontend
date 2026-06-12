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
            class="marquee-item mx-8 inline-flex shrink-0 items-center justify-center text-3xl font-extrabold uppercase leading-none tracking-[0.08em] text-slate-300/90 transition-colors duration-300 md:mx-10 md:text-4xl"
            :target="shouldOpenNewTab(item.url) ? '_blank' : undefined"
            :rel="shouldOpenNewTab(item.url) ? 'noopener noreferrer' : undefined"
          >
            <img
              v-if="item.logo"
              :src="item.logo"
              :alt="item.name || 'Trusted logo'"
              :width="item.logoWidth || 160"
              :height="item.logoHeight || 48"
              class="trusted-logo h-10 w-auto object-contain transition-[filter,opacity,transform] duration-300 md:h-12"
              loading="lazy"
              decoding="async"
            >
            <span v-else>{{ item.name }}</span>
          </NuxtLink>

          <div
            v-else
            class="marquee-item mx-8 inline-flex shrink-0 items-center justify-center text-3xl font-extrabold uppercase leading-none tracking-[0.08em] text-slate-300/90 transition-colors duration-300 md:mx-10 md:text-4xl"
          >
            <img
              v-if="item.logo"
              :src="item.logo"
              :alt="item.name || 'Trusted logo'"
              :width="item.logoWidth || 160"
              :height="item.logoHeight || 48"
              class="trusted-logo h-10 w-auto object-contain transition-[filter,opacity,transform] duration-300 md:h-12"
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
  opacity: 0.85;
  filter: grayscale(1) contrast(0.95) brightness(0.78);
}

.marquee-item:hover .trusted-logo {
  opacity: 1;
  filter: none;
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
    margin-left: 1.1rem;
    margin-right: 1.1rem;
    font-size: 1.65rem;
  }

  .marquee-track .trusted-logo {
    height: 2rem;
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
