<script setup lang="ts">
import { computed } from 'vue'

type SectionBackground = 'white' | 'light' | 'dark' | 'transparent'
type SectionContainer = 'normal' | 'wide' | 'narrow' | 'full'

interface Props {
  as?: string
  id?: string
  background?: SectionBackground
  container?: SectionContainer
  noPaddingTop?: boolean
  noPaddingBottom?: boolean
  reveal?: boolean
  visible?: boolean
  sectionClass?: string
  containerClass?: string
  contentClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  as: 'section',
  id: undefined,
  background: 'transparent',
  container: 'normal',
  noPaddingTop: false,
  noPaddingBottom: false,
  reveal: false,
  visible: false,
  sectionClass: '',
  containerClass: '',
  contentClass: ''
})

const backgroundClassMap: Record<SectionBackground, string> = {
  white: 'bg-white text-[#001c2a]',
  light: 'bg-slate-50 text-[#001c2a]',
  dark: 'bg-[#001c2a] text-white',
  transparent: 'bg-transparent text-inherit'
}

const containerClassMap: Record<SectionContainer, string> = {
  normal: 'mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8',
  wide: 'mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8',
  narrow: 'mx-auto w-full max-w-[900px] px-4 sm:px-6 lg:px-8',
  full: 'mx-auto w-full max-w-none px-4 sm:px-6 lg:px-8'
}

const paddingClass = computed(() => {
  if (props.noPaddingTop && props.noPaddingBottom) {
    return ''
  }

  if (props.noPaddingTop) {
    return 'pb-16 md:pb-24 lg:pb-28'
  }

  if (props.noPaddingBottom) {
    return 'pt-16 md:pt-24 lg:pt-28'
  }

  return 'py-16 md:py-24 lg:py-28'
})

const revealClass = computed(() => {
  if (!props.reveal) {
    return ''
  }

  return props.visible
    ? 'translate-y-0 opacity-100 transition duration-700 ease-out motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none'
    : 'translate-y-6 opacity-0 transition duration-700 ease-out motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none'
})

const sectionClasses = computed(() => [
  backgroundClassMap[props.background],
  paddingClass.value,
  props.sectionClass
])

const containerClasses = computed(() => [
  containerClassMap[props.container],
  props.containerClass
])

const contentClasses = computed(() => [
  revealClass.value,
  props.contentClass
])
</script>

<template>
  <component
    :is="as"
    :id="id"
    :class="sectionClasses"
  >
    <div :class="containerClasses">
      <div :class="contentClasses">
        <slot />
      </div>
    </div>
  </component>
</template>
