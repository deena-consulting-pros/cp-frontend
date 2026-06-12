<script setup lang="ts">
interface Props {
  label?: string
}

withDefaults(defineProps<Props>(), {
  label: 'Loading...'
})
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-4 py-12"
    role="status"
    aria-live="polite"
  >
    <div
      class="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"
      aria-hidden="true"
    />
    <p class="text-sm font-medium text-slate-600">
      {{ label }}
    </p>
  </div>
</template>
