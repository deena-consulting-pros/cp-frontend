<script setup lang="ts">
import type { ServicesPageData } from '~/types/services'

type ServicesFinalCta = ServicesPageData['finalCta']

const props = withDefaults(defineProps<{
  cta?: ServicesFinalCta
}>(), {
  cta: () => ({
    title: '',
    description: '',
    primaryButton: {
      label: '',
      url: '',
      newTab: false
    },
    secondaryButton: {
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

const fallbackTitle = 'Ready to Grow Your Digital Presence?'
const fallbackDescription = 'Partner with Consulting Pros FZC to improve your online visibility, strengthen your website experience, and build a clearer path for digital growth.'

const resolvedTitle = computed(() => props.cta?.title?.trim() || fallbackTitle)
const resolvedDescription = computed(() => props.cta?.description?.trim() || fallbackDescription)

const resolvedPrimaryLabel = computed(() => props.cta?.primaryButton?.label?.trim() || 'Get Free Consultation')
const resolvedPrimaryUrl = computed(() => props.cta?.primaryButton?.url?.trim() || '/contact')
const resolvedPrimaryNewTab = computed(() => Boolean(props.cta?.primaryButton?.newTab))

const resolvedSecondaryLabel = computed(() => props.cta?.secondaryButton?.label?.trim() || 'Speak to an Expert')
const resolvedSecondaryUrl = computed(() => props.cta?.secondaryButton?.url?.trim() || '/contact')
const resolvedSecondaryNewTab = computed(() => Boolean(props.cta?.secondaryButton?.newTab))
const localPatternImage = '/images/cubes.webp'
const resolvedPatternImage = computed(() => props.cta?.backgroundImage?.trim() || localPatternImage)

const isExternalUrl = (url: string) => /^(https?:|mailto:|tel:)/i.test(url)
const shouldUsePrimaryAnchor = computed(() => resolvedPrimaryNewTab.value || isExternalUrl(resolvedPrimaryUrl.value))
const shouldUseSecondaryAnchor = computed(() => resolvedSecondaryNewTab.value || isExternalUrl(resolvedSecondaryUrl.value))
const patternLayerStyle = computed(() => ({
  backgroundImage: resolvedPatternImage.value === localPatternImage
    ? `url('${localPatternImage}')`
    : `url('${resolvedPatternImage.value}'), url('${localPatternImage}')`,
  backgroundRepeat: 'repeat',
  backgroundPosition: 'center',
  backgroundSize: '80px auto'
}))

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
  <section ref="sectionRef" aria-labelledby="services-final-cta-title">
    <div class="services-cta-reveal relative overflow-hidden rounded-[2.2rem] bg-[#001c2a] px-6 py-12 text-center shadow-[0_24px_64px_rgba(0,28,42,0.26)] sm:px-10 md:rounded-[2.6rem] md:px-14 md:py-16 lg:rounded-[3rem] lg:px-20 lg:py-24" :class="{ 'is-visible': isVisible }">
      <div class="pointer-events-none absolute inset-0 z-0 opacity-[0.24]" :style="patternLayerStyle" aria-hidden="true" />
      <div class="pointer-events-none absolute inset-0 z-0 bg-[#001c2a]/58" aria-hidden="true" />
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(100%_85%_at_18%_8%,rgba(103,252,198,0.08)_0%,rgba(0,28,42,0)_60%)]" aria-hidden="true" />

      <div class="relative z-10 mx-auto max-w-[50rem]">
        <h2 id="services-final-cta-title" class="text-[clamp(1.9rem,4vw,3.5rem)] font-black leading-[1.08] tracking-[-0.03em] text-white">
          {{ resolvedTitle }}
        </h2>

        <p class="mx-auto mt-5 max-w-[47.5rem] text-[clamp(1rem,1.22vw,1.24rem)] leading-8 text-slate-200/90">
          {{ resolvedDescription }}
        </p>

        <div class="mt-9 flex flex-col items-stretch justify-center gap-4 sm:mt-10 sm:flex-row">
          <NuxtLink
            v-if="!shouldUsePrimaryAnchor"
            :to="resolvedPrimaryUrl"
            class="services-cta-button services-cta-button--primary inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#67fcc6] px-8 py-4 text-base font-bold text-[#001c2a] shadow-[0_14px_36px_rgba(103,252,198,0.2)] sm:w-auto"
          >
            {{ resolvedPrimaryLabel }}
          </NuxtLink>
          <a
            v-else
            :href="resolvedPrimaryUrl"
            class="services-cta-button services-cta-button--primary inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#67fcc6] px-8 py-4 text-base font-bold text-[#001c2a] shadow-[0_14px_36px_rgba(103,252,198,0.2)] sm:w-auto"
            :target="resolvedPrimaryNewTab ? '_blank' : undefined"
            :rel="resolvedPrimaryNewTab ? 'noopener noreferrer' : undefined"
          >
            {{ resolvedPrimaryLabel }}
          </a>

          <NuxtLink
            v-if="!shouldUseSecondaryAnchor"
            :to="resolvedSecondaryUrl"
            class="services-cta-button services-cta-button--secondary inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-[#67fcc6]/65 bg-transparent px-8 py-4 text-base font-bold text-[#dcfff0] sm:w-auto"
          >
            {{ resolvedSecondaryLabel }}
          </NuxtLink>
          <a
            v-else
            :href="resolvedSecondaryUrl"
            class="services-cta-button services-cta-button--secondary inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-[#67fcc6]/65 bg-transparent px-8 py-4 text-base font-bold text-[#dcfff0] sm:w-auto"
            :target="resolvedSecondaryNewTab ? '_blank' : undefined"
            :rel="resolvedSecondaryNewTab ? 'noopener noreferrer' : undefined"
          >
            {{ resolvedSecondaryLabel }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.services-cta-reveal {
  opacity: 0;
  transform: translateY(24px);
}

.services-cta-reveal.is-visible {
  animation: servicesCtaFadeUp 0.72s ease-out both;
}

.services-cta-button {
  transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.services-cta-button--primary:hover,
.services-cta-button--primary:focus-visible {
  transform: translateY(-2px) scale(1.015);
  background: #e8fff6;
  box-shadow: 0 18px 42px rgba(103, 252, 198, 0.28);
}

.services-cta-button--secondary:hover,
.services-cta-button--secondary:focus-visible {
  transform: translateY(-2px) scale(1.015);
  border-color: #86ffd8;
  background: rgba(103, 252, 198, 0.12);
}

.services-cta-button:active {
  transform: translateY(0) scale(0.985);
}

@keyframes servicesCtaFadeUp {
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
  .services-cta-reveal {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none !important;
  }

  .services-cta-button {
    transition: none;
  }

  .services-cta-button:hover,
  .services-cta-button:focus-visible,
  .services-cta-button:active {
    transform: none;
  }
}
</style>