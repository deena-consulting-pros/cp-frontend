<script setup lang="ts">
import type { ContactPageData } from '~/types/contact'

const props = withDefaults(defineProps<{
  heading?: ContactPageData['nextStepsHeading']
  steps?: ContactPageData['nextSteps']
}>(), {
  heading: () => ({ label: 'WHAT HAPPENS NEXT', title: 'A Simple Way to Start', highlightText: '', subtitle: 'Once you send your message, we will review your needs and suggest a practical next step.', alignment: 'center' }),
  steps: () => []
})

const fallbackSteps = [
  { id: 'step-1', title: 'Share your goals', description: 'Submit the form with details about your project, current challenges, and desired outcomes.', iconKey: 'check-circle', order: 0 },
  { id: 'step-2', title: 'We review your needs', description: 'Our consultants analyze your requirements to ensure we are the right fit for your specific growth stage.', iconKey: 'search', order: 1 },
  { id: 'step-3', title: 'Best next step', description: 'We suggest a tailored roadmap to kickstart your digital success.', iconKey: 'target', order: 2 }
]

const visibleSteps = computed(() => {
  const list = props.steps.length ? props.steps : fallbackSteps
  return [...list]
    .filter((step) => step.title || step.description)
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
    .slice(0, 3)
})
</script>

<template>
  <section>
    <SectionHeading
      :heading="heading"
      :alignment="heading?.alignment as 'left' | 'center' | 'right' | ''"
      margin-bottom-class="mb-12"
      max-width="max-w-[44rem]"
    />

    <div class="grid gap-6 md:grid-cols-3">
      <article
        v-for="(step, index) in visibleSteps"
        :key="step.id"
        class="next-step-card relative flex min-h-[18rem] flex-col rounded-[1.6rem] p-8 md:p-9"
      >
        <span class="step-chip">0{{ index + 1 }}</span>
        <span class="icon-badge mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full text-[#006c4f]">
          <AppIcon :icon-key="step.iconKey" class="h-4.5 w-4.5" />
        </span>
        <h3 class="text-[1.22rem] font-semibold text-[#001c2a]">{{ step.title }}</h3>
        <p v-if="step.description" class="mt-3 text-[1rem] leading-7 text-slate-600">{{ step.description }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.next-step-card {
  border: 1px solid #e1e5e9;
  background: #ffffff;
  overflow: hidden;
}

.step-chip {
  position: absolute;
  top: 0;
  right: 0;
  border-bottom-left-radius: 999px;
  padding: 0.5rem 0.95rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: #006c4f;
  background: #e7fcf3;
}

.icon-badge {
  background: #dff8ee;
}
</style>
