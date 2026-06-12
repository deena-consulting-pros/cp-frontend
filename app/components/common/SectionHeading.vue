<script setup lang="ts">
interface SectionHeadingData {
  label?: string | null
  title?: string | null
  subtitle?: string | null
  highlightText?: string | null
  alignment?: string | null
}

const props = withDefaults(defineProps<{
  heading?: SectionHeadingData | null
  id?: string
  alignment?: 'left' | 'center' | 'right' | ''
  maxWidth?: string
  dark?: boolean
  visible?: boolean
  revealClass?: string
  titleClass?: string
  subtitleClass?: string
  labelClass?: string
  titleColor?: string
  subtitleColor?: string
  labelColor?: string
  centerContainer?: boolean
  marginBottomClass?: string
}>(), {
  heading: null,
  id: '',
  alignment: '',
  maxWidth: 'max-w-[44rem]',
  dark: false,
  visible: true,
  revealClass: '',
  titleClass: '',
  subtitleClass: '',
  labelClass: '',
  titleColor: '',
  subtitleColor: '',
  labelColor: '',
  centerContainer: true,
  marginBottomClass: 'mb-14'
})

const hasHeading = computed(() => Boolean(props.heading))
const hasContent = computed(() => Boolean(
  props.heading?.label
  || props.heading?.title
  || props.heading?.subtitle
))

const resolvedAlignment = computed<'left' | 'center' | 'right'>(() => {
  const requested = (props.alignment || props.heading?.alignment || 'center').toLowerCase()
  if (requested === 'left' || requested === 'right' || requested === 'center') return requested
  return 'center'
})

const alignmentClass = computed(() => {
  if (resolvedAlignment.value === 'left') return 'text-left'
  if (resolvedAlignment.value === 'right') return 'text-right'
  return 'text-center'
})

const headingParts = computed(() => {
  const title = props.heading?.title || ''
  const highlight = props.heading?.highlightText || ''
  if (!highlight || !title.includes(highlight)) {
    return { before: title, highlight: '', after: '' }
  }
  const idx = title.indexOf(highlight)
  return {
    before: title.slice(0, idx),
    highlight,
    after: title.slice(idx + highlight.length)
  }
})

const titleClasses = computed(() => [
  'section-title',
  props.dark ? 'text-white' : '',
  props.titleClass
])

const subtitleClasses = computed(() => [
  'section-subtitle mt-5',
  props.dark ? 'text-slate-300' : '',
  props.subtitleClass
])

const labelClasses = computed(() => [
  'eyebrow mb-4',
  props.dark ? 'text-[#8fd5c0]' : '',
  props.labelClass
])

const headerClasses = computed(() => [
  props.centerContainer ? 'mx-auto' : '',
  props.marginBottomClass,
  props.maxWidth,
  alignmentClass.value,
  props.revealClass,
  props.visible ? 'is-visible' : ''
])

const highlightStyle = computed(() => ({
  color: props.dark ? '#67fcc6' : '#006c4f'
}))

const titleStyle = computed(() => {
  if (props.titleColor) return { color: props.titleColor }
  if (props.dark) return { color: '#ffffff' }
  return {}
})

const subtitleStyle = computed(() => {
  if (props.subtitleColor) return { color: props.subtitleColor }
  if (props.dark) return { color: '#cbd5e1' }
  return {}
})

const labelStyle = computed(() => {
  if (props.labelColor) return { color: props.labelColor }
  if (props.dark) return { color: '#8fd5c0' }
  return {}
})
</script>

<template>
  <header v-if="hasHeading && hasContent" :class="headerClasses">
    <p v-if="heading?.label" :class="labelClasses" :style="labelStyle">{{ heading.label }}</p>
    <h2 v-if="heading?.title" :id="id || undefined" :class="titleClasses" :style="titleStyle">
      <template v-if="headingParts.highlight">
        {{ headingParts.before }}<span :style="highlightStyle">{{ headingParts.highlight }}</span>{{ headingParts.after }}
      </template>
      <template v-else>
        {{ heading.title }}
      </template>
    </h2>
    <p v-if="heading?.subtitle" :class="subtitleClasses" :style="subtitleStyle">{{ heading.subtitle }}</p>
  </header>
</template>
