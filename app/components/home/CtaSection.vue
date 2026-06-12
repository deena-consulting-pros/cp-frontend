<script setup lang="ts">
import type { HomepageData } from '~/types/homepage'
import type { AboutFinalCta } from '~/types/about'

type FinalCta = HomepageData['finalCta'] | AboutFinalCta

const props = withDefaults(defineProps<{
  cta?: FinalCta
}>(), {
  cta: () => ({
    title: '',
    description: '',
    button: {
      label: '',
      url: '',
      newTab: false
    },
    backgroundImage: '',
    variant: ''
  })
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const hasContent = computed(() => Boolean(
  props.cta?.title
  || props.cta?.description
  || props.cta?.button?.label
))

const buttonHref = computed(() => props.cta?.button?.url || '')
const isExternalUrl = (url: string) => /^(https?:|mailto:|tel:)/i.test(url)
const isButtonExternal = computed(() => isExternalUrl(buttonHref.value))
const isButtonNewTab = computed(() => Boolean(props.cta?.button?.newTab || props.cta?.button?.openNewTab))

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
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' })

  if (sectionRef.value) observer.observe(sectionRef.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    v-if="hasContent"
    ref="sectionRef"
    aria-labelledby="final-cta-title"
  >
    <div
      class="cta-reveal relative overflow-hidden rounded-[2.2rem] bg-[#001c2a] px-6 py-12 text-center shadow-[0_24px_64px_rgba(0,28,42,0.26)] sm:px-10 md:rounded-[2.6rem] md:px-14 md:py-16 lg:rounded-[3rem] lg:px-20 lg:py-24"
      :class="{ 'is-visible': isVisible }"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_90%_at_14%_12%,rgba(103,252,198,0.2)_0%,rgba(103,252,198,0.08)_34%,rgba(0,28,42,0)_68%)]"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -right-28 -top-20 h-72 w-72 rounded-full bg-[rgba(103,252,198,0.14)] blur-3xl"
        aria-hidden="true"
      />
      <img
        v-if="cta?.backgroundImage"
        :src="cta.backgroundImage"
        alt=""
        class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12] mix-blend-screen"
        loading="lazy"
        decoding="async"
        aria-hidden="true"
      >

      <div class="relative z-10 mx-auto max-w-[50rem]">
        <h2
          id="final-cta-title"
          class="text-[clamp(1.9rem,4vw,3.5rem)] font-black leading-[1.08] tracking-[-0.03em] text-white"
        >
          {{ cta?.title }}
        </h2>

        <p
          v-if="cta?.description"
          class="mx-auto mt-5 max-w-[47.5rem] text-[clamp(1rem,1.22vw,1.24rem)] leading-8 text-slate-200/90"
        >
          {{ cta.description }}
        </p>

        <NuxtLink
          v-if="cta?.button?.label && buttonHref && !isButtonExternal"
          :to="buttonHref"
          class="cta-button mt-9 inline-flex w-full items-center justify-center rounded-2xl bg-[#67fcc6] px-8 py-4 text-base font-bold text-[#001c2a] shadow-[0_14px_36px_rgba(103,252,198,0.2)] sm:mt-10 sm:w-auto"
          :target="isButtonNewTab ? '_blank' : undefined"
          :rel="isButtonNewTab ? 'noopener noreferrer' : undefined"
        >
          {{ cta.button.label }}
        </NuxtLink>
        <a
          v-else-if="cta?.button?.label && buttonHref"
          :href="buttonHref"
          class="cta-button mt-9 inline-flex w-full items-center justify-center rounded-2xl bg-[#67fcc6] px-8 py-4 text-base font-bold text-[#001c2a] shadow-[0_14px_36px_rgba(103,252,198,0.2)] sm:mt-10 sm:w-auto"
          :target="isButtonNewTab ? '_blank' : undefined"
          :rel="isButtonNewTab ? 'noopener noreferrer' : undefined"
        >
          {{ cta.button.label }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cta-reveal {
  opacity: 0;
  transform: translateY(24px);
}

.cta-reveal.is-visible {
  animation: ctaFadeUp 0.72s ease-out both;
}

.cta-button {
  transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease;
}

.cta-button:hover,
.cta-button:focus-visible {
  transform: translateY(-2px) scale(1.015);
  background: #e8fff6;
  box-shadow: 0 18px 42px rgba(103, 252, 198, 0.28);
}

.cta-button:active {
  transform: translateY(0) scale(0.985);
}

@keyframes ctaFadeUp {
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
  .cta-reveal {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none !important;
  }

  .cta-button {
    transition: none;
  }

  .cta-button:hover,
  .cta-button:focus-visible,
  .cta-button:active {
    transform: none;
  }
}
</style>
