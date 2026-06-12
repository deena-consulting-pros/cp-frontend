<script setup lang="ts">
import type { ServicesPageData } from '~/types/services'

type FeaturedHeading = ServicesPageData['featuredServicesSection']
type FeaturedService = ServicesPageData['serviceCards'][number]

const props = withDefaults(defineProps<{
  heading?: FeaturedHeading | null
  services?: FeaturedService[]
}>(), {
  heading: null,
  services: () => []
})

const sectionRef = ref<HTMLElement | null>(null)
const headingVisible = ref(false)
const visibleCardIds = ref<Set<string>>(new Set())
let headingObserver: IntersectionObserver | null = null
let cardObserver: IntersectionObserver | null = null

const featuredServices = computed(() => {
  return [...(props.services || [])]
    .filter((service) => service?.isFeatured === true)
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
})

const hasServices = computed(() => featuredServices.value.length > 0)
const hasHeading = computed(() => Boolean(
  props.heading?.label
  || props.heading?.title
  || props.heading?.subtitle
))

const isExternalUrl = (url: string) => /^(https?:)?\/\//i.test(url) || url.startsWith('mailto:') || url.startsWith('tel:')
const toServiceDetailPath = (service: FeaturedService) => {
  const slug = service?.slug?.trim()
  return slug ? `/services/${slug}` : ''
}
const ctaUrl = (service: FeaturedService) => toServiceDetailPath(service) || service?.showcaseButtonUrl?.trim() || service?.ctaLink?.trim() || '/services'
const ctaLabel = (service: FeaturedService) => service?.showcaseButtonLabel?.trim() || 'Get Started'
const cardTitle = (service: FeaturedService) => service?.showcaseTitle?.trim() || service?.title?.trim() || ''
const cardDescription = (service: FeaturedService) => service?.showcaseDescription?.trim() || paragraphFromDescription(service)
const hasImage = (service: FeaturedService) => Boolean(service?.featuredImage)
const shouldUseAnchor = (service: FeaturedService) => service.showcaseButtonNewTab || isExternalUrl(ctaUrl(service))

const collectText = (node: unknown): string[] => {
  if (!node) return []
  if (typeof node === 'string') return [node.trim()].filter(Boolean)
  if (Array.isArray(node)) return node.flatMap(collectText)
  if (typeof node !== 'object') return []

  const source = node as Record<string, unknown>
  const current = typeof source.text === 'string' ? [source.text.trim()] : []
  const children = Array.isArray(source.children) ? source.children.flatMap(collectText) : []
  return [...current, ...children].filter(Boolean)
}

const listItemsFromDescription = (description: unknown) => {
  if (!description) return [] as string[]

  if (Array.isArray(description)) {
    const items = description.flatMap((block) => {
      const source = block as Record<string, unknown>
      if (source.type === 'list' || source.type === 'bulleted-list' || source.type === 'numbered-list') {
        const children = Array.isArray(source.children) ? source.children : []
        return children.map((item) => collectText(item).join(' ').replace(/\s+/g, ' ').trim()).filter(Boolean)
      }
      return []
    })
    return [...new Set(items)]
  }

  if (typeof description === 'string') {
    return description
      .split('\n')
      .map(line => line.trim())
      .filter(line => /^[-*]\s+/.test(line))
      .map(line => line.replace(/^[-*]\s+/, '').trim())
      .filter(Boolean)
  }

  return []
}

const normalizeFeatureItems = (items: string[]) => items
  .map(item => item.trim())
  .filter(Boolean)

const cardFeatures = (service: FeaturedService) => {
  const showcaseFeatures = normalizeFeatureItems(service?.showcaseFeatures || [])
  if (showcaseFeatures.length) return showcaseFeatures

  const descriptionFeatures = listItemsFromDescription(service?.description)
  if (descriptionFeatures.length) return descriptionFeatures

  // TODO(Strapi): if showcaseFeatures stays empty and description has no list blocks,
  // add a repeatable feature field in the Service schema for showcase bullet points.
  return []
}

const paragraphFromDescription = (service: FeaturedService) => {
  if (service.shortDescription?.trim()) return service.shortDescription.trim()
  const chunks = collectText(service.description)
  return chunks.join(' ').replace(/\s+/g, ' ').trim()
}

onMounted(() => {
  if (!import.meta.client || !sectionRef.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    headingVisible.value = true
    visibleCardIds.value = new Set(featuredServices.value.map((service) => service.id))
    return
  }

  headingObserver = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      headingVisible.value = true
      headingObserver?.disconnect()
    }
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' })

  cardObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const id = (entry.target as HTMLElement).dataset.cardId
      if (!id) continue
      const next = new Set(visibleCardIds.value)
      next.add(id)
      visibleCardIds.value = next
      cardObserver?.unobserve(entry.target)
    }
  }, { threshold: 0.22, rootMargin: '0px 0px -10% 0px' })

  headingObserver.observe(sectionRef.value)
  const cards = sectionRef.value.querySelectorAll<HTMLElement>('[data-card-id]')
  cards.forEach(card => cardObserver?.observe(card))
})

onBeforeUnmount(() => {
  headingObserver?.disconnect()
  cardObserver?.disconnect()
})
</script>

<template>
  <section
    v-if="hasServices"
    ref="sectionRef"
    class="featured-showcase-section"
    aria-labelledby="featured-services-title"
  >
    <div class="featured-showcase-container mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <div
        v-if="hasHeading"
        class="featured-heading-reveal"
        :class="{ 'is-visible': headingVisible }"
      >
        <SectionHeading
          id="featured-services-title"
          :heading="heading || undefined"
          :alignment="(heading?.alignment as 'left' | 'center' | 'right' | '') || ''"
          max-width="max-w-[72rem]"
          margin-bottom-class="mb-14 md:mb-16 lg:mb-20"
        />
      </div>

      <div class="flex flex-col gap-16 lg:gap-20">
        <article
          v-for="(service, index) in featuredServices"
          :key="service.id"
          :data-card-id="service.id"
          class="featured-card overflow-hidden rounded-[1.75rem] border border-[rgba(0,28,42,0.12)] bg-white shadow-[0_24px_70px_rgba(0,28,42,0.08)] md:rounded-[2.1rem] lg:min-h-[540px] lg:rounded-[40px]"
          :class="{
            'is-visible': visibleCardIds.has(service.id),
            'featured-card--reverse': index % 2 === 1 && hasImage(service),
            'featured-card--text-only': !hasImage(service)
          }"
        >
          <div class="featured-card-grid grid gap-0">
            <div class="featured-card-content flex items-center p-8 md:p-12 lg:p-16 xl:p-20">
              <div class="w-full max-w-[680px]">
                <p
                  v-if="service.showcaseEyebrow"
                  class="mb-4 text-[0.85rem] font-extrabold uppercase tracking-[0.18em] text-[#006c4f]"
                >
                  {{ service.showcaseEyebrow }}
                </p>

                <h3 class="font-display text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] text-[#001c2a] md:text-[2.75rem] lg:text-5xl">
                  {{ cardTitle(service) }}
                </h3>

                <p
                  v-if="cardDescription(service)"
                  class="mt-6 max-w-[40rem] text-[1.08rem] leading-[1.75] text-slate-700 md:text-[1.14rem] lg:text-[1.2rem]"
                >
                  {{ cardDescription(service) }}
                </p>

                <ul v-if="cardFeatures(service).length" class="mt-8 space-y-3.5">
                  <li
                    v-for="(item, featureIndex) in cardFeatures(service)"
                    :key="`${service.id}-feature-${featureIndex}`"
                    class="flex items-start gap-3.5 text-[1.03rem] leading-7 text-slate-700"
                  >
                    <span class="mt-[2px] inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[#d8f8ea] text-[#006c4f]">
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="h-[14px] w-[14px]"
                        aria-hidden="true"
                      >
                        <path d="m4 10 4 4 8-8" />
                      </svg>
                    </span>
                    <span>{{ item }}</span>
                  </li>
                </ul>

                <div class="mt-9">
                  <NuxtLink
                    v-if="!shouldUseAnchor(service)"
                    :to="ctaUrl(service)"
                    class="showcase-cta"
                  >
                    {{ ctaLabel(service) }}
                  </NuxtLink>
                  <a
                    v-else
                    :href="ctaUrl(service)"
                    class="showcase-cta"
                    :target="service.showcaseButtonNewTab ? '_blank' : undefined"
                    :rel="service.showcaseButtonNewTab ? 'noopener noreferrer' : undefined"
                  >
                    {{ ctaLabel(service) }}
                  </a>
                </div>
              </div>
            </div>

            <div
              v-if="service.featuredImage"
              class="featured-card-image min-h-[300px] bg-slate-200 sm:min-h-[340px] lg:min-h-[540px]"
            >
              <img
                :src="service.featuredImage"
                :alt="cardTitle(service) || service.title || 'Service image'"
                class="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              >
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.featured-showcase-section {
  width: 100%;
}

.featured-heading-reveal,
.featured-card {
  opacity: 0;
  transform: translateY(20px);
}

.featured-heading-reveal.is-visible {
  animation: featuredFadeUp 0.7s ease-out both;
}

.featured-card.is-visible {
  animation: featuredFadeUp 0.74s ease-out both;
}

.featured-card {
  transition: transform 0.24s ease, box-shadow 0.24s ease;
}

.featured-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 28px 56px rgba(0, 28, 42, 0.15);
}

.showcase-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  min-height: 52px;
  border: 0;
  border-radius: 999px;
  background: #001c2a;
  color: #fff;
  padding: 1rem 1.75rem;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1;
  text-decoration: none !important;
  box-shadow: 0 16px 35px rgba(0, 28, 42, 0.18);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.showcase-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 40px rgba(0, 28, 42, 0.24);
  text-decoration: none;
}

@media (min-width: 1024px) {
  .featured-card-grid {
    min-height: 540px;
    height: 100%;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    grid-template-areas: "content image";
  }

  .featured-card--reverse .featured-card-grid {
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
    grid-template-areas: "image content";
  }

  .featured-card-content,
  .featured-card-image {
    min-height: 540px;
  }

  .featured-card-content {
    grid-area: content;
  }

  .featured-card-image {
    grid-area: image;
    height: 100%;
  }

  .featured-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .featured-card--text-only .featured-card-content {
    grid-area: content;
    grid-column: 1 / -1;
    max-width: 100%;
  }
}

@media (max-width: 1023px) {
  .featured-card {
    min-height: 0;
  }

  .featured-card-grid {
    grid-template-columns: minmax(0, 2fr) minmax(0, 2fr);
    grid-template-areas: "content image";
  }

  .featured-card--reverse .featured-card-grid {
    grid-template-areas: "image content";
  }

  .featured-card-content {
    grid-area: content;
    min-height: 0;
  }

  .featured-card-image {
    grid-area: image;
    min-height: 280px;
  }
}

@media (max-width: 768px) {
  .featured-card-grid {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "content"
      "image";
  }

  .featured-card--reverse .featured-card-grid {
    grid-template-areas:
      "content"
      "image";
  }
}

@media (max-width: 767px) {
  .featured-card {
    border-radius: 28px;
  }

  .featured-card-content h3 {
    font-size: 2rem;
    line-height: 1.08;
  }
}

@keyframes featuredFadeUp {
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
  .featured-heading-reveal,
  .featured-card,
  .featured-card:hover,
  .showcase-cta,
  .showcase-cta:hover {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none;
  }
}
</style>

