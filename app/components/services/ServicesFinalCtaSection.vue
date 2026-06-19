<script setup lang="ts">
import type { ServicesPageData } from '~/types/services'

type ServicesFinalCta = ServicesPageData['finalCta']

const props = withDefaults(defineProps<{
  cta?: ServicesFinalCta
}>(), {
  cta: () => ({
    title: '',
    description: '',
    primaryButton: {
      label: '',
      url: '',
      newTab: false
    },
    secondaryButton: {
      label: '',
      url: '',
      newTab: false
    },
    backgroundImage: '',
    variant: ''
  })
})

const { resolveImageUrl } = useStrapi()

const fallbackTitle = 'Ready to Grow Your Digital Presence?'
const fallbackDescription = 'Partner with Consulting Pros FZC to improve your online visibility, strengthen your website experience, and build a clearer path for digital growth.'

const resolvedTitle = computed(() => props.cta?.title?.trim() || fallbackTitle)
const resolvedDescription = computed(() => props.cta?.description?.trim() || fallbackDescription)

const resolvedPrimaryLabel = computed(() => props.cta?.primaryButton?.label?.trim() || 'Get Free Consultation')
const resolvedPrimaryUrl = computed(() => props.cta?.primaryButton?.url?.trim() || '/contact')
const resolvedPrimaryNewTab = computed(() => Boolean(props.cta?.primaryButton?.newTab))

const resolvedSecondaryLabel = computed(() => props.cta?.secondaryButton?.label?.trim() || 'Speak to an Expert')
const resolvedSecondaryUrl = computed(() => props.cta?.secondaryButton?.url?.trim() || '/contact')
const resolvedSecondaryNewTab = computed(() => Boolean(props.cta?.secondaryButton?.newTab))

const localPatternImage = '/images/cubes.webp'
const resolvedPatternImage = computed(() => {
  const bg = props.cta?.backgroundImage
  const bgUrl = bg ? resolveImageUrl(bg) : ''
  return bgUrl?.trim() || localPatternImage
})
</script>

<template>
  <BottomCtaSection
    :title="resolvedTitle"
    :description="resolvedDescription"
    :primary-label="resolvedPrimaryLabel"
    :primary-to="resolvedPrimaryUrl"
    :primary-new-tab="resolvedPrimaryNewTab"
    :secondary-label="resolvedSecondaryLabel"
    :secondary-to="resolvedSecondaryUrl"
    :secondary-new-tab="resolvedSecondaryNewTab"
    :background-image="resolvedPatternImage"
    :variant="cta?.variant === 'teal' ? 'teal' : 'navy'"
    background-repeat
  />
</template>
