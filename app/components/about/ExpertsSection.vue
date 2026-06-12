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

const sortedExperts = computed(() => {
  return [...(props.experts || [])]
    .filter((expert) => expert?.title || expert?.role || expert?.description)
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
})

const hasExperts = computed(() => sortedExperts.value.length > 0)

const headingData = computed(() => ({
  ...(props.heading || {}),
  alignment: (props.heading?.alignment || 'left')
}))

const normalizedIconKey = (expert: AboutExpertItem) => {
  return resolveIconKey(expert?.iconKey) || fallbackIconKey
}

const expertImageUrl = (expert: AboutExpertItem) => resolveImageUrl(expert?.image)

const imageAlt = (expert: AboutExpertItem) => {
  return expert.title || expert.role || 'Expert profile'
}

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
    v-if="hasExperts"
    ref="sectionRef"
    class="w-full overflow-x-clip"
    aria-labelledby="about-experts-title"
  >
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

    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="(expert, index) in sortedExperts"
        :key="expert.id || `about-expert-${index}`"
        class="expert-card group flex h-full flex-col rounded-[1.75rem] border border-[#dbe5ec] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] md:p-6"
        :class="{ 'is-visible': isVisible }"
        :style="{ '--expert-delay': `${80 + (index * 100)}ms` }"
      >
        <div class="image-shell mb-6 overflow-hidden rounded-[1.3rem]">
          <img
            v-if="expertImageUrl(expert)"
            :src="expertImageUrl(expert)"
            :alt="imageAlt(expert)"
            class="expert-image h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          >
          <div
            v-else
            class="expert-placeholder flex h-full w-full items-center justify-center bg-gradient-to-br from-[#001c2a] to-[#0f2f41] text-[#8fd5c0]"
            aria-hidden="true"
          >
            <AppIcon
              :icon-key="normalizedIconKey(expert)"
              :title="expert.title"
              :card-type="expert.role"
              class="placeholder-icon h-12 w-12 md:h-14 md:w-14"
            />
          </div>
        </div>

        <h3 class="text-[1.26rem] font-bold leading-[1.28] tracking-[-0.01em] text-[#001c2a]">
          {{ expert.title }}
        </h3>

        <p v-if="expert.role" class="mt-2 text-[0.97rem] font-semibold leading-6 text-[#006c4f]">
          {{ expert.role }}
        </p>

        <p v-if="expert.description" class="mt-3 text-[0.96rem] leading-7 text-slate-600">
          {{ expert.description }}
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.experts-heading-reveal,
.expert-card {
  opacity: 0;
  transform: translateY(20px);
}

.experts-heading-reveal.is-visible {
  animation: expertsFadeUp 0.68s ease-out both;
}

.expert-card.is-visible {
  animation: expertsFadeUp 0.72s ease-out var(--expert-delay, 80ms) both;
}

.expert-card {
  transition: transform 0.26s ease, box-shadow 0.26s ease, border-color 0.26s ease;
}

.image-shell {
  aspect-ratio: 4 / 5;
}

.expert-image,
.placeholder-icon {
  transition: transform 0.34s ease;
}

.expert-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 24px 54px rgba(15, 23, 42, 0.13);
  border-color: #bfd5df;
}

.expert-card:hover .expert-image {
  transform: scale(1.04);
}

.expert-card:hover .placeholder-icon {
  transform: scale(1.06);
}

@keyframes expertsFadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .experts-heading-reveal,
  .expert-card {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none;
  }

  .expert-card:hover,
  .expert-card:hover .expert-image,
  .expert-card:hover .placeholder-icon {
    transform: none;
  }
}
</style>
