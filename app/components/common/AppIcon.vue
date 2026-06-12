<script setup lang="ts">
import { HERO_ICON_DEFS, resolveHeroIcon } from '~/utils/iconMap'

const props = withDefaults(defineProps<{
  iconKey?: string | null
  title?: string | null
  cardType?: string | null
  class?: string
}>(), {
  iconKey: '',
  title: '',
  cardType: '',
  class: ''
})

const iconDef = computed(() => HERO_ICON_DEFS[resolveHeroIcon(props.iconKey, props.cardType, props.title)])
</script>

<template>
  <svg
    :viewBox="iconDef.viewBox"
    :class="props.class"
    :fill="iconDef.renderMode === 'stroke' ? 'none' : 'currentColor'"
    :stroke="iconDef.renderMode === 'stroke' ? 'currentColor' : 'none'"
    :stroke-width="iconDef.renderMode === 'stroke' ? (iconDef.strokeWidth ?? 1.75) : 0"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path
      v-for="path in iconDef.paths"
      :key="path"
      :d="path"
    />
  </svg>
</template>
