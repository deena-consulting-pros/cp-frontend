<script setup lang="ts">
import type { ServicesPageData } from '~/types/services'

type PartnershipHeading = ServicesPageData['partnershipStagesSection']
type PartnershipStage = ServicesPageData['partnershipStages'][number]

const fallbackHeading: PartnershipHeading = {
  label: 'Service Packages',
  title: 'Choose the Right Stage for Your Growth',
  highlightText: 'Your Growth',
  subtitle: 'Whether you are launching, growing, or scaling your digital presence, we can shape the right service mix around your goals.',
  alignment: 'center'
}

const fallbackStages: PartnershipStage[] = [
  {
    id: 'partnership-stage-fallback-launch',
    title: 'Launch',
    description: 'Build a strong digital foundation with the right website, visibility, and campaign setup.',
    bullets: ['Core setup', 'Initial campaign support', 'Foundational optimization'],
    ctaLabel: 'Start with Launch',
    ctaUrl: '/contact',
    ctaNewTab: false,
    featured: false,
    order: 1,
    iconKey: ''
  },
  {
    id: 'partnership-stage-fallback-growth',
    title: 'Growth',
    description: 'Improve visibility, traffic quality, and enquiries with connected SEO, PPC, content, and website improvements.',
    bullets: ['SEO and content planning', 'PPC support', 'Monthly performance review'],
    ctaLabel: 'Choose Growth',
    ctaUrl: '/contact',
    ctaNewTab: false,
    featured: true,
    order: 2,
    iconKey: ''
  },
  {
    id: 'partnership-stage-fallback-scale',
    title: 'Scale',
    description: 'Strengthen your digital presence with ongoing optimization, advanced improvements, and multi-channel support.',
    bullets: ['Optimization cycles', 'Performance improvements', 'Reporting support'],
    ctaLabel: 'Discuss Scale',
    ctaUrl: '/contact',
    ctaNewTab: false,
    featured: false,
    order: 3,
    iconKey: ''
  }
]

const props = withDefaults(defineProps<{
  heading?: PartnershipHeading | null
  stages?: PartnershipStage[]
}>(), {
  heading: () => ({ label: '', title: '', highlightText: '', subtitle: '', alignment: 'center' }),
  stages: () => []
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

const sortedStages = computed<PartnershipStage[]>(() => {
  const source = [...(props.stages || [])]
    .filter((stage) => stage?.title || stage?.description)
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
  return source.length ? source : fallbackStages
})

const featuredStageId = computed(() => {
  const explicit = sortedStages.value.find((stage) => stage.featured)
  if (explicit?.id) return explicit.id
  return sortedStages.value[1]?.id || sortedStages.value[0]?.id || ''
})

const normalizedHeading = computed<PartnershipHeading>(() => {
  if (props.heading?.label || props.heading?.title || props.heading?.subtitle) {
    return {
      label: props.heading.label || fallbackHeading.label,
      title: props.heading.title || fallbackHeading.title,
      highlightText: props.heading.highlightText || fallbackHeading.highlightText,
      subtitle: props.heading.subtitle || fallbackHeading.subtitle,
      alignment: props.heading.alignment || fallbackHeading.alignment
    }
  }
  return fallbackHeading
})

const hasContent = computed(() => sortedStages.value.length > 0)
const isExternalUrl = (url: string) => /^(https?:)?\/\//i.test(url) || url.startsWith('mailto:') || url.startsWith('tel:')
const stageBullets = (stage: PartnershipStage) => (stage.bullets || []).map((i) => String(i || '').trim()).filter(Boolean)
const stageCtaLabel = (stage: PartnershipStage) => stage.ctaLabel?.trim() || 'Get Started'
const stageCtaUrl = (stage: PartnershipStage) => stage.ctaUrl?.trim() || '/contact'
const shouldUseAnchor = (stage: PartnershipStage) => stage.ctaNewTab || isExternalUrl(stageCtaUrl(stage))

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
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' })
  if (sectionRef.value) observer.observe(sectionRef.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section v-if="hasContent" ref="sectionRef" class="w-full overflow-x-clip" aria-labelledby="services-partnership-stages-title">
    <SectionHeading
      id="services-partnership-stages-title"
      :heading="normalizedHeading"
      :alignment="normalizedHeading.alignment as 'left' | 'center' | 'right' | ''"
      reveal-class="partnership-heading-reveal"
      :visible="isVisible"
      margin-bottom-class="mb-8 md:mb-9 lg:mb-10"
      max-width="max-w-[56rem]"
    />

    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:items-stretch lg:gap-7">
      <article
        v-for="(stage, index) in sortedStages"
        :key="stage.id || `partnership-stage-${index}`"
        class="partnership-stage-card relative flex h-full flex-col rounded-[1.85rem] border px-7 pb-7 pt-8 shadow-[0_16px_35px_rgba(0,28,42,0.08)] md:px-8 md:pb-8 md:pt-9"
        :class="{ 'is-visible': isVisible, 'partnership-stage-card--featured': stage.id === featuredStageId, 'partnership-stage-card--default': stage.id !== featuredStageId }"
        :style="{ '--partnership-delay': `${index * 85}ms` }"
      >
        <span
          v-if="stage.id === featuredStageId"
          class="partnership-recommended"
        >Recommended</span>

        <h3 class="text-center text-[1.5rem] font-extrabold leading-[1.18] tracking-[-0.015em]">
          {{ stage.title }}
        </h3>

        <p v-if="stage.description" class="mt-3 text-center text-[0.99rem] leading-[1.72]">
          {{ stage.description }}
        </p>

        <hr class="my-6 border-0 border-t" aria-hidden="true">

        <ul class="space-y-3.5">
          <li v-for="(item, bulletIndex) in stageBullets(stage)" :key="`${stage.id || index}-bullet-${bulletIndex}`" class="flex items-start gap-3 text-[0.96rem] leading-6">
            <span class="mt-[3px] inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-[15px] w-[15px]">
                <path d="M3 8.5 6.2 11.5 13 4.8" />
              </svg>
            </span>
            <span>{{ item }}</span>
          </li>
        </ul>

        <div class="mt-auto pt-7">
          <NuxtLink v-if="!shouldUseAnchor(stage)" :to="stageCtaUrl(stage)" class="partnership-stage-cta">{{ stageCtaLabel(stage) }}</NuxtLink>
          <a v-else :href="stageCtaUrl(stage)" class="partnership-stage-cta" :target="stage.ctaNewTab ? '_blank' : undefined" :rel="stage.ctaNewTab ? 'noopener noreferrer' : undefined">{{ stageCtaLabel(stage) }}</a>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.partnership-heading-reveal,
.partnership-stage-card {
  opacity: 0;
  transform: translateY(18px);
}
.partnership-heading-reveal.is-visible { animation: partnershipFadeUp 0.62s ease-out both; }
.partnership-stage-card.is-visible { animation: partnershipFadeUp 0.62s ease-out var(--partnership-delay, 0ms) both; }

.partnership-stage-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.partnership-stage-card:hover { transform: translateY(-3px); }

.partnership-stage-card--default {
  border-color: #dbe6ee;
  background: #fff;
  color: #475569;
}
.partnership-stage-card--default h3 { color: #001c2a; }
.partnership-stage-card--default hr { border-color: #e2e8f0; }
.partnership-stage-card--default li { color: #475569; }
.partnership-stage-card--default li svg { color: #008a63; }

.partnership-stage-card--featured {
  border-color: #66eec0;
  background: #001c2a;
  color: #c3dbe7;
  box-shadow: 0 20px 44px rgba(0, 28, 42, 0.24);
}
.partnership-stage-card--featured h3 { color: #f1fbff; }
.partnership-stage-card--featured hr { border-color: rgba(181, 210, 224, 0.35); }
.partnership-stage-card--featured li { color: #cde1ea; }
.partnership-stage-card--featured p { color: #cde1ea; }
.partnership-stage-card--featured li svg { color: #67fcc6; }

.partnership-recommended {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%, -50%);
  display: inline-flex;
  border-radius: 999px;
  background: #67fcc6;
  color: #003022;
  padding: 0.4rem 0.8rem;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.partnership-stage-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 50px;
  border-radius: 999px;
  border: 1.5px solid;
  padding: 0.88rem 1rem;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1;
  text-decoration: none !important;
  transition: transform 0.22s ease, box-shadow 0.22s ease, background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease;
}
.partnership-stage-card--default .partnership-stage-cta { border-color: #0d3448; color: #0d3448; background: transparent; }
.partnership-stage-card--default .partnership-stage-cta:hover,
.partnership-stage-card--default .partnership-stage-cta:focus-visible { transform: translateY(-2px) scale(1.01); background: #f4f8fb; box-shadow: 0 12px 24px rgba(13, 52, 72, 0.16); }
.partnership-stage-card--featured .partnership-stage-cta { border-color: #67fcc6; color: #003022; background: #67fcc6; }
.partnership-stage-card--featured .partnership-stage-cta:hover,
.partnership-stage-card--featured .partnership-stage-cta:focus-visible { transform: translateY(-2px) scale(1.01); border-color: #86ffd8; background: #86ffd8; box-shadow: 0 12px 26px rgba(103, 252, 198, 0.28); }
.partnership-stage-cta:active { transform: translateY(0) scale(0.985); }

@keyframes partnershipFadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .partnership-heading-reveal,
  .partnership-stage-card,
  .partnership-stage-cta {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none;
  }
}
</style>
