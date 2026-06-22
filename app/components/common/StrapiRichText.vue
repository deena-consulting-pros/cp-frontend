<script setup lang="ts">
import { renderStrapiRichText } from "~/utils/strapiRichText";

interface Props {
  content?: unknown;
  class?: string;
}

const props = defineProps<Props>();

const html = computed(() => renderStrapiRichText(props.content));
const hasContent = computed(() => Boolean(html.value.trim()));
</script>

<template>
  <div
    v-if="hasContent"
    class="strapi-rich-text"
    :class="props.class"
    v-html="html"
  />
</template>

<style scoped>
.strapi-rich-text :deep(*:first-child) {
  margin-top: 0;
}

.strapi-rich-text :deep(*:last-child) {
  margin-bottom: 0;
}
</style>
