<script setup lang="ts">
interface Props {
  eyebrow?: string
  title: string
  description?: string
  primaryLabel: string
  primaryTo: string
  primaryNewTab?: boolean
  secondaryLabel?: string
  secondaryTo?: string
  secondaryNewTab?: boolean
  backgroundImage?: string
  variant?: 'navy' | 'teal'
  noReveal?: boolean
  backgroundRepeat?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: '',
  description: '',
  primaryNewTab: false,
  secondaryLabel: '',
  secondaryTo: '',
  secondaryNewTab: false,
  backgroundImage: '',
  variant: 'navy',
  noReveal: false,
  backgroundRepeat: false
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(props.noReveal)
let observer: IntersectionObserver | null = null

const isExternalUrl = (url: string) => /^(https?:|mailto:|tel:)/i.test(url)

const primaryIsExternal = computed(() => isExternalUrl(props.primaryTo))
const secondaryIsExternal = computed(() => props.secondaryTo ? isExternalUrl(props.secondaryTo) : false)

const backgroundStyle = computed(() => {
  if (!props.backgroundImage) return undefined
  return { backgroundImage: `url('${props.backgroundImage}')` }
})

onMounted(() => {
  if (props.noReveal || isVisible.value) return
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
    ref="sectionRef"
    class="mx-auto w-full max-w-[920px]"
    aria-labelledby="bottom-cta-title"
  >
    <div
      class="bottom-cta-card relative overflow-hidden rounded-[2rem] px-6 py-12 text-center shadow-[0_24px_64px_rgba(0,28,42,0.26)] sm:px-10 md:rounded-[2.6rem] md:px-14 md:py-16 lg:rounded-[3rem] lg:px-20 lg:py-24"
      :class="[
        variant === 'teal' ? 'bg-[#003247]' : 'bg-[#001c2a]',
        { 'is-visible': isVisible }
      ]"
    >
      <div
        v-if="backgroundImage"
        class="pointer-events-none absolute inset-0 z-0 bg-center opacity-[0.14]"
        :class="backgroundRepeat ? 'bg-repeat' : 'bg-cover'"
        :style="backgroundStyle"
        aria-hidden="true"
      />

      <div
        class="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(110%_90%_at_14%_12%,rgba(103,252,198,0.2)_0%,rgba(103,252,198,0.08)_34%,rgba(0,28,42,0)_68%)]"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -right-28 -top-20 h-72 w-72 rounded-full bg-[rgba(103,252,198,0.14)] blur-3xl"
        aria-hidden="true"
      />

      <div class="relative z-10 mx-auto max-w-[50rem]">
        <span
          v-if="eyebrow"
          class="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-[#67fcc6] sm:text-sm"
        >
          {{ eyebrow }}
        </span>

        <h2
          id="bottom-cta-title"
          class="text-[clamp(1.9rem,4vw,3.5rem)] font-black leading-[1.08] tracking-[-0.03em] text-white"
        >
          {{ title }}
        </h2>

        <p
          v-if="description"
          class="mx-auto mt-5 max-w-[47.5rem] text-[clamp(1rem,1.22vw,1.24rem)] leading-8 text-slate-200/90"
        >
          {{ description }}
        </p>

        <div class="mt-9 flex flex-col items-stretch justify-center gap-4 sm:mt-10 sm:flex-row">
          <NuxtLink
            v-if="!primaryIsExternal && !primaryNewTab"
            :to="primaryTo"
            class="bottom-cta-button bottom-cta-button--primary inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#67fcc6] px-8 py-4 text-base font-bold text-[#001c2a] shadow-[0_14px_36px_rgba(103,252,198,0.2)] sm:w-auto"
          >
            {{ primaryLabel }}
          </NuxtLink>
          <a
            v-else
            :href="primaryTo"
            class="bottom-cta-button bottom-cta-button--primary inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#67fcc6] px-8 py-4 text-base font-bold text-[#001c2a] shadow-[0_14px_36px_rgba(103,252,198,0.2)] sm:w-auto"
            :target="primaryNewTab || primaryIsExternal ? '_blank' : undefined"
            :rel="primaryNewTab || primaryIsExternal ? 'noopener noreferrer' : undefined"
          >
            {{ primaryLabel }}
          </a>

          <NuxtLink
            v-if="secondaryLabel && secondaryTo && !secondaryIsExternal && !secondaryNewTab"
            :to="secondaryTo"
            class="bottom-cta-button bottom-cta-button--secondary inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-[#67fcc6]/65 bg-transparent px-8 py-4 text-base font-bold text-[#dcfff0] sm:w-auto"
          >
            {{ secondaryLabel }}
          </NuxtLink>
          <a
            v-else-if="secondaryLabel && secondaryTo"
            :href="secondaryTo"
            class="bottom-cta-button bottom-cta-button--secondary inline-flex min-h-14 w-full items-center justify-center rounded-2xl border border-[#67fcc6]/65 bg-transparent px-8 py-4 text-base font-bold text-[#dcfff0] sm:w-auto"
            :target="secondaryNewTab || secondaryIsExternal ? '_blank' : undefined"
            :rel="secondaryNewTab || secondaryIsExternal ? 'noopener noreferrer' : undefined"
          >
            {{ secondaryLabel }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bottom-cta-card {
  opacity: 0;
  transform: translateY(24px);
}

.bottom-cta-card.is-visible {
  animation: bottomCtaFadeUp 0.72s ease-out both;
}

.bottom-cta-button {
  transition: transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.bottom-cta-button--primary:hover,
.bottom-cta-button--primary:focus-visible {
  transform: translateY(-2px) scale(1.015);
  background: #e8fff6;
  box-shadow: 0 18px 42px rgba(103, 252, 198, 0.28);
}

.bottom-cta-button--secondary:hover,
.bottom-cta-button--secondary:focus-visible {
  transform: translateY(-2px) scale(1.015);
  border-color: #86ffd8;
  background: rgba(103, 252, 198, 0.12);
}

.bottom-cta-button:active {
  transform: translateY(0) scale(0.985);
}

@keyframes bottomCtaFadeUp {
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
  .bottom-cta-card {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none !important;
  }

  .bottom-cta-button {
    transition: none;
  }

  .bottom-cta-button:hover,
  .bottom-cta-button:focus-visible,
  .bottom-cta-button:active {
    transform: none;
  }
}
</style>
