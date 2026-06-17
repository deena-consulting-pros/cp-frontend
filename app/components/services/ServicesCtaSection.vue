<script setup lang="ts">
import type { ServicesPageData } from '~/types/services'

type ServicesCtaSection = NonNullable<ServicesPageData['ctaSection']>

const props = withDefaults(defineProps<{
  cta?: ServicesCtaSection | null
}>(), {
  cta: null
})

const { resolveImageUrl } = useStrapi()

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const hasContent = computed(() => Boolean(
  props.cta?.isEnabled
  && (props.cta?.eyebrow || props.cta?.title || props.cta?.description || props.cta?.primaryButton?.label)
))

const backgroundImageUrl = computed(() => resolveImageUrl(props.cta?.backgroundImage))

const isExternalUrl = (url: string) => /^(https?:|mailto:|tel:)/i.test(url)

const variantClass = computed(() => {
  switch (props.cta?.variant) {
    case 'green':
      return 'services-cta-section--green'
    case 'light':
      return 'services-cta-section--light'
    case 'navy':
    default:
      return 'services-cta-section--navy'
  }
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
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' })

  if (sectionRef.value) observer.observe(sectionRef.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section
    v-if="hasContent"
    ref="sectionRef"
    class="services-cta-section relative w-full overflow-hidden"
    :class="[{ 'is-visible': isVisible }, variantClass]"
    aria-labelledby="services-cta-title"
  >
    <img
      v-if="backgroundImageUrl"
      :src="backgroundImageUrl"
      alt=""
      class="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-[0.14]"
      loading="lazy"
      decoding="async"
      aria-hidden="true"
    >

    <div
      v-if="cta?.variant !== 'light'"
      class="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[#001c2a]/80 to-[#001c2a]/95"
      aria-hidden="true"
    />
    <div
      v-if="cta?.variant !== 'light'"
      class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(100%_85%_at_18%_8%,rgba(103,252,198,0.08)_0%,rgba(0,28,42,0)_60%)]"
      aria-hidden="true"
    />

    <div class="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-6 py-12 sm:px-8 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:px-12 lg:py-16">
      <div class="max-w-3xl">
        <span
          v-if="cta?.eyebrow"
          class="services-cta-eyebrow mb-3 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-[#67fcc6] sm:text-sm"
        >
          {{ cta.eyebrow }}
        </span>

        <h2
          id="services-cta-title"
          class="text-3xl font-bold leading-[1.12] tracking-[-0.02em] text-white sm:text-4xl lg:text-5xl"
        >
          {{ cta?.title }}
        </h2>

        <p
          v-if="cta?.description"
          class="mt-3 max-w-2xl text-base leading-7 text-slate-200/90 sm:text-lg sm:leading-8"
        >
          {{ cta.description }}
        </p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row lg:justify-end">
        <NuxtLink
          v-if="cta?.primaryButton?.label && cta.primaryButton.url && !isExternalUrl(cta.primaryButton.url)"
          :to="cta.primaryButton.url"
          class="services-cta-button services-cta-button--primary inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#67fcc6] px-6 py-3 text-sm font-bold text-[#001c2a] shadow-[0_10px_28px_rgba(103,252,198,0.2)] sm:w-auto sm:px-7 sm:py-3.5"
        >
          {{ cta.primaryButton.label }}
        </NuxtLink>
        <a
          v-else-if="cta?.primaryButton?.label && cta.primaryButton.url"
          :href="cta.primaryButton.url"
          class="services-cta-button services-cta-button--primary inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#67fcc6] px-6 py-3 text-sm font-bold text-[#001c2a] shadow-[0_10px_28px_rgba(103,252,198,0.2)] sm:w-auto sm:px-7 sm:py-3.5"
          :target="cta.primaryButton.newTab ? '_blank' : undefined"
          :rel="cta.primaryButton.newTab ? 'noopener noreferrer' : undefined"
        >
          {{ cta.primaryButton.label }}
        </a>

        <NuxtLink
          v-if="cta?.secondaryButton?.label && cta.secondaryButton.url && !isExternalUrl(cta.secondaryButton.url)"
          :to="cta.secondaryButton.url"
          class="services-cta-button services-cta-button--secondary inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#67fcc6]/65 bg-transparent px-6 py-3 text-sm font-bold text-[#dcfff0] sm:w-auto sm:px-7 sm:py-3.5"
        >
          {{ cta.secondaryButton.label }}
        </NuxtLink>
        <a
          v-else-if="cta?.secondaryButton?.label && cta.secondaryButton.url"
          :href="cta.secondaryButton.url"
          class="services-cta-button services-cta-button--secondary inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[#67fcc6]/65 bg-transparent px-6 py-3 text-sm font-bold text-[#dcfff0] sm:w-auto sm:px-7 sm:py-3.5"
          :target="cta.secondaryButton.newTab ? '_blank' : undefined"
          :rel="cta.secondaryButton.newTab ? 'noopener noreferrer' : undefined"
        >
          {{ cta.secondaryButton.label }}
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.services-cta-section {
  opacity: 0;
  transform: translateY(24px);
  background: #001c2a;
}

.services-cta-section.is-visible {
  animation: servicesCtaSectionFadeUp 0.72s ease-out both;
}

.services-cta-section--green {
  background: #006c4f;
}

.services-cta-section--light {
  background: #ffffff;
}

.services-cta-section--light h2,
.services-cta-section--light .services-cta-title {
  color: #001c2a;
}

.services-cta-section--light .services-cta-eyebrow {
  color: #006c4f;
}

.services-cta-section--light p {
  color: rgba(30, 41, 59, 0.85);
}

.services-cta-section--light .services-cta-button--primary {
  background: #006c4f;
  color: #ffffff;
  box-shadow: 0 10px 28px rgba(0, 108, 79, 0.22);
}

.services-cta-section--light .services-cta-button--primary:hover,
.services-cta-section--light .services-cta-button--primary:focus-visible {
  background: #00523c;
  box-shadow: 0 14px 36px rgba(0, 108, 79, 0.28);
}

.services-cta-section--light .services-cta-button--secondary {
  border-color: rgba(0, 108, 79, 0.55);
  color: #006c4f;
}

.services-cta-section--light .services-cta-button--secondary:hover,
.services-cta-section--light .services-cta-button--secondary:focus-visible {
  background: rgba(0, 108, 79, 0.08);
  border-color: #006c4f;
}

.services-cta-button {
  transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.services-cta-button--primary:hover,
.services-cta-button--primary:focus-visible {
  transform: translateY(-2px) scale(1.015);
  background: #e8fff6;
  box-shadow: 0 14px 36px rgba(103, 252, 198, 0.28);
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

@keyframes servicesCtaSectionFadeUp {
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
  .services-cta-section {
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
