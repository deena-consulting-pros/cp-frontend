<script setup lang="ts">
import type { ContactInfoCard } from '~/types/contact'

const trustedProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:'])

const props = withDefaults(defineProps<{
  cards?: ContactInfoCard[]
}>(), {
  cards: () => []
})

const fallbackCards: ContactInfoCard[] = [
  {
    id: 'contact-card-email',
    title: 'Email Us',
    description: 'hello@consultingpros.ae',
    linkLabel: '',
    linkUrl: '',
    iconKey: 'mail',
    order: 0
  },
  {
    id: 'contact-card-location',
    title: 'Location',
    description: 'UAE / Remote-friendly global reach',
    linkLabel: '',
    linkUrl: '',
    iconKey: 'map-pin',
    order: 1
  },
  {
    id: 'contact-card-response',
    title: 'Response Time',
    description: 'Within 24 business hours',
    linkLabel: '',
    linkUrl: '',
    iconKey: 'clock',
    order: 2
  },
  {
    id: 'contact-card-consult',
    title: 'Consultation',
    description: 'Free 30-min strategy sessions available',
    linkLabel: '',
    linkUrl: '',
    iconKey: 'users',
    order: 3
  }
]

const visibleCards = computed(() => {
  const list = props.cards.length ? props.cards : fallbackCards
  return [...list]
    .filter((card) => card.title || card.description || card.linkLabel || card.linkUrl)
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
})

const normalizeHref = (value?: string) => {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^#/.test(trimmed)) return trimmed

  try {
    const parsed = new URL(trimmed, 'https://consultingpros.local')
    return trustedProtocols.has(parsed.protocol) ? trimmed : ''
  }
  catch {
    return ''
  }
}

const isExternalHttp = (value?: string) => Boolean(value && /^https?:/i.test(value))
</script>

<template>
  <div class="grid content-start gap-5">
    <article
      v-for="card in visibleCards"
      :key="card.id"
      class="info-card rounded-[1.35rem] p-6"
    >
      <div class="flex items-start gap-3">
        <span class="icon-badge inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#006c4f]">
          <AppIcon :icon-key="card.iconKey" class="h-5 w-5" />
        </span>
        <div>
          <h3 class="text-[1.02rem] font-semibold text-[#001c2a]">{{ card.title }}</h3>
          <p v-if="card.description" class="mt-1.5 text-[0.94rem] leading-7 text-slate-600">{{ card.description }}</p>

          <a
            v-if="normalizeHref(card.linkUrl)"
            :href="normalizeHref(card.linkUrl)"
            class="mt-2 inline-block text-sm font-semibold text-[#006c4f] underline decoration-[#006c4f]/30 underline-offset-4"
            :target="isExternalHttp(card.linkUrl) ? '_blank' : undefined"
            :rel="isExternalHttp(card.linkUrl) ? 'noopener noreferrer' : undefined"
          >
            {{ card.linkLabel || card.linkUrl }}
          </a>
          <p v-else-if="card.linkLabel" class="mt-2 text-sm font-semibold text-[#006c4f]">{{ card.linkLabel }}</p>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.info-card {
  border: 1px solid #dfe3e7;
  background: rgba(255, 255, 255, 0.82);
}

.icon-badge {
  border: 1px solid #d2efe2;
  background: #e8fbf4;
}
</style>
