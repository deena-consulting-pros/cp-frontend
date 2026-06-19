<script setup lang="ts">
import type { HomepageData } from '~/types/homepage'
import type { AboutFinalCta } from '~/types/about'

type FinalCta = HomepageData['finalCta'] | AboutFinalCta

const props = withDefaults(defineProps<{
  cta?: FinalCta
}>(), {
  cta: () => ({
    title: '',
    description: '',
    button: {
      label: '',
      url: '',
      newTab: false,
      openNewTab: false
    },
    backgroundImage: '',
    variant: ''
  })
})

const hasContent = computed(() => Boolean(
  props.cta?.title
  || props.cta?.description
  || props.cta?.button?.label
))

const button = computed(() => props.cta?.button)
const isNewTab = computed(() => Boolean(button.value?.newTab || button.value?.openNewTab))
const backgroundImageUrl = computed(() => {
  const bg = props.cta?.backgroundImage
  return typeof bg === 'string' ? bg : ''
})
</script>

<template>
  <BottomCtaSection
    v-if="hasContent"
    :title="cta?.title || ''"
    :description="cta?.description || ''"
    :primary-label="button?.label || ''"
    :primary-to="button?.url || ''"
    :primary-new-tab="isNewTab"
    :background-image="backgroundImageUrl"
    :variant="cta?.variant === 'teal' ? 'teal' : 'navy'"
  />
</template>
