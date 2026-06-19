<script setup lang="ts">
import type { ContactFinalCta } from '~/types/contact'

const props = withDefaults(defineProps<{
  cta?: ContactFinalCta
}>(), {
  cta: () => ({
    title: '',
    description: '',
    button: {
      label: '',
      url: '#contact-form',
      newTab: false
    }
  })
})

const trustedProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:'])

const buttonHref = computed(() => {
  const raw = props.cta?.button?.url?.trim() || '#contact-form'
  if (/^#/.test(raw)) return raw
  try {
    const parsed = new URL(raw, 'https://consultingpros.local')
    return trustedProtocols.has(parsed.protocol) ? raw : '#contact-form'
  }
  catch {
    return '#contact-form'
  }
})

const isNewTab = computed(() => Boolean(props.cta?.button?.newTab))
</script>

<template>
  <BottomCtaSection
    :title="cta?.title || ''"
    :description="cta?.description || ''"
    :primary-label="cta?.button?.label || ''"
    :primary-to="buttonHref"
    :primary-new-tab="isNewTab"
    variant="navy"
    no-reveal
  />
</template>
