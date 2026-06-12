<script setup lang="ts">
import { computed } from 'vue'
import { resolveSocialIconName, SOCIAL_ICON_DEFS } from '~/utils/socialIcons'

const props = withDefaults(defineProps<{
  name?: string | null
  url?: string | null
  title?: string | null
  class?: string
}>(), {
  name: '',
  url: '',
  title: '',
  class: ''
})

const iconName = computed(() => resolveSocialIconName(props.name, props.url))
const iconDef = computed(() => SOCIAL_ICON_DEFS[iconName.value] || null)
</script>

<template>
  <svg
    v-if="iconDef"
    :viewBox="iconDef.viewBox"
    :class="props.class"
    xmlns="http://www.w3.org/2000/svg"
    :fill="iconDef.renderMode === 'fill' ? 'currentColor' : 'none'"
    :stroke="iconDef.renderMode === 'stroke' ? 'currentColor' : 'none'"
    aria-hidden="true"
  >
    <component
      :is="node.tag"
      v-for="(node, index) in iconDef.nodes"
      :key="`${iconName}-${index}`"
      v-bind="node.attrs"
      :fill="iconDef.renderMode === 'fill' ? 'currentColor' : undefined"
      :stroke="iconDef.renderMode === 'stroke' ? 'currentColor' : undefined"
    />
  </svg>
</template>
