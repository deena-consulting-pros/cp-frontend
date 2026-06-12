<script setup lang="ts">
import type { AboutMissionVisionCard } from '~/types/about'

const props = withDefaults(defineProps<{
  cards?: AboutMissionVisionCard[]
}>(), {
  cards: () => []
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const fallbackIconKey = 'target'

const sortedCards = computed(() => {
  return [...(props.cards || [])]
    .filter(card => card?.title || card?.description)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
})

const hasCards = computed(() => sortedCards.value.length > 0)

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
  }, { threshold: 0.24, rootMargin: '0px 0px -10% 0px' })

  if (sectionRef.value) observer.observe(sectionRef.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section
    v-if="hasCards"
    ref="sectionRef"
    class="w-full overflow-x-clip"
    aria-label="Mission and vision"
  >
    <div class="mx-auto max-w-[1120px]">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:gap-10">
        <article
          v-for="(card, index) in sortedCards"
          :key="card.id || `mission-vision-card-${index}`"
          class="mission-card h-full rounded-[1.6rem] border border-[#e3ece9] bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.08)] md:p-8 lg:p-10"
          :class="{ 'is-visible': isVisible }"
          :style="{ '--card-delay': `${index * 100}ms` }"
        >
          <span class="mission-icon mb-7 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf7f2] text-[#006c4f]" aria-hidden="true">
            <AppIcon
              :icon-key="card.iconKey || fallbackIconKey"
              :title="card.title"
              class="h-7 w-7"
            />
          </span>

          <h3 class="text-[1.55rem] font-bold leading-[1.25] tracking-[-0.01em] text-[#001c2a] md:text-[1.72rem]">
            {{ card.title }}
          </h3>

          <p v-if="card.description" class="mt-4 text-[1rem] leading-[1.85] text-slate-600">
            {{ card.description }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mission-card {
  opacity: 0;
  transform: translateY(20px);
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
}

.mission-card.is-visible {
  animation: missionCardFadeUp 0.7s ease-out var(--card-delay, 0ms) both;
}

.mission-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 52px rgba(15, 23, 42, 0.12);
  border-color: #d6e6df;
}

.mission-icon {
  transition: transform 0.26s ease, background-color 0.26s ease;
}

.mission-card:hover .mission-icon {
  transform: translateY(-2px) scale(1.03);
  background-color: #def3e9;
}

@keyframes missionCardFadeUp {
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
  .mission-card {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none;
  }

  .mission-card:hover,
  .mission-card:hover .mission-icon {
    transform: none;
  }
}
</style>
