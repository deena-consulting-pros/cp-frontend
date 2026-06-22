<script setup lang="ts">
import type { AboutExpertItem, AboutSectionHeading } from '~/types/about'
import { resolveIconKey } from '~/utils/iconMap'

const props = withDefaults(defineProps<{
  heading?: AboutSectionHeading | null
  experts?: AboutExpertItem[]
}>(), {
  heading: () => ({
    label: '',
    title: '',
    subtitle: '',
    highlightText: '',
    alignment: 'left'
  }),
  experts: () => []
})

const { resolveImageUrl } = useStrapi()
const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const fallbackIconKey = 'briefcase'

const activeExperts = computed(() => {
  return [...(props.experts || [])]
    .filter((expert) => expert?.title || expert?.role || expert?.description || expert?.image)
    .filter((expert) => expert?.isActive !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
})

const hasExperts = computed(() => activeExperts.value.length > 0)

const teamCount = computed(() => activeExperts.value.length)

const teamCountClass = computed(() => {
  if (teamCount.value >= 7) return 'team-count-many'
  return `team-count-${teamCount.value}`
})

const teamCardWidthClass = computed(() => {
  const count = teamCount.value

  // 1–2 experts: centered cards with a comfortable max width
  if (count <= 2) return 'lg:max-w-[22rem]'

  // 3 experts: one row of three on desktop
  if (count === 3) return 'lg:w-[calc(33.333%-1.34rem)]'

  // 4 experts: four in one row on large desktop
  if (count === 4) return 'lg:w-[calc(25%-1.5rem)]'

  // 5–6 experts: up to four per row on large desktop, final row centered
  if (count === 5 || count === 6) return 'lg:w-[calc(33.333%-1.34rem)] xl:w-[calc(25%-1.5rem)]'

  // 7+ experts: up to four per row on large desktop, final row centered
  return 'lg:w-[calc(33.333%-1.34rem)] xl:w-[calc(25%-1.5rem)]'
})

const headingData = computed(() => ({
  ...(props.heading || {}),
  alignment: (props.heading?.alignment || 'left')
}))

const normalizedIconKey = (expert: AboutExpertItem) => {
  return resolveIconKey(expert?.iconKey) || fallbackIconKey
}

const expertImageUrl = (expert: AboutExpertItem) => resolveImageUrl(expert?.image)

const imageAlt = (expert: AboutExpertItem) => {
  return expert.title || expert.role || 'Team member profile'
}

let revealFallback: ReturnType<typeof window.setTimeout> | null = null

onMounted(() => {
  if (!import.meta.client) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isVisible.value = true
    return
  }

  revealFallback = window.setTimeout(() => {
    isVisible.value = true
  }, 700)

  observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      isVisible.value = true
      if (revealFallback) window.clearTimeout(revealFallback)
      observer?.disconnect()
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })

  if (sectionRef.value) observer.observe(sectionRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  if (revealFallback) window.clearTimeout(revealFallback)
})
</script>

<template>
  <section
    v-if="hasExperts"
    ref="sectionRef"
    class="w-full overflow-x-clip"
    aria-labelledby="about-experts-title"
  >
    <div class="mx-auto max-w-[1200px]">
      <div class="experts-heading-reveal" :class="{ 'is-visible': isVisible }">
        <SectionHeading
          id="about-experts-title"
          :heading="headingData"
          alignment="left"
          :center-container="false"
          margin-bottom-class="mb-10 md:mb-12"
          max-width="max-w-[52rem]"
        />
      </div>

      <div
        class="team-list flex flex-wrap justify-center gap-8"
        :class="teamCountClass"
      >
        <div
          v-for="(expert, index) in activeExperts"
          :key="expert.id || `about-expert-${index}`"
          class="team-card-reveal w-full sm:w-[calc(50%-1rem)]"
          :class="[teamCardWidthClass, { 'is-visible': isVisible }]"
          :style="{ '--team-delay': `${80 + (index * 100)}ms` }"
        >
          <article
            class="team-card group relative mt-16 flex h-full flex-col rounded-[1.8rem] border border-slate-200 bg-white px-6 pb-7 pt-24 shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
          >
            <div
              class="absolute inset-x-0 top-0 h-20 rounded-t-[1.8rem] bg-gradient-to-br from-[#eaf7f2] to-[#d6f7ea]"
              aria-hidden="true"
            />

            <div
              class="absolute left-1/2 top-0 z-10 h-32 w-32 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-[#eaf7f2] shadow-[0_16px_34px_rgba(15,23,42,0.12)] ring-8 ring-white"
            >
              <img
                v-if="expertImageUrl(expert)"
                :src="expertImageUrl(expert)"
                :alt="imageAlt(expert)"
                class="h-full w-full object-cover"
                width="128"
                height="128"
                loading="lazy"
                decoding="async"
              >
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#001c2a] to-[#0f2f41] text-[#8fd5c0]"
                aria-hidden="true"
              >
                <AppIcon
                  :icon-key="normalizedIconKey(expert)"
                  :title="expert.title"
                  :card-type="expert.role"
                  class="h-12 w-12"
                />
              </div>
            </div>

            <div class="relative z-[1] flex flex-1 flex-col text-center">
              <h3 class="text-[1.26rem] font-bold leading-[1.28] tracking-[-0.01em] text-[#001c2a]">
                {{ expert.title }}
              </h3>

              <p
                v-if="expert.role"
                class="mt-2 text-[0.9rem] font-semibold leading-5 text-[#006c4f]"
              >
                {{ expert.role }}
              </p>

              <p
                v-if="expert.description"
                class="mt-4 text-[0.95rem] leading-7 text-slate-600"
              >
                {{ expert.description }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.experts-heading-reveal,
.team-card-reveal {
  opacity: 0;
  transform: translate3d(0, 18px, 0);
  transition:
    opacity 0.65s ease,
    transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--team-delay, 0ms);
  will-change: opacity, transform;
}

.experts-heading-reveal.is-visible,
.team-card-reveal.is-visible {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.team-card {
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    border-color 0.28s ease;
}

.team-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 54px rgba(15, 23, 42, 0.13);
  border-color: #bfd5df;
}

@media (prefers-reduced-motion: reduce) {
  .experts-heading-reveal,
  .team-card-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .team-card {
    transition: none;
  }

  .team-card:hover {
    transform: none;
  }
}

@media (scripting: none) {
  .experts-heading-reveal,
  .team-card-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
