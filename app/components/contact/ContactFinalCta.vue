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

const isExternal = computed(() => /^(https?:|mailto:|tel:)/i.test(buttonHref.value))
</script>

<template>
  <div class="cta-shell rounded-[1.8rem] px-6 py-12 text-center sm:px-10 lg:px-14 lg:py-14">
    <h2 class="relative z-[1] text-[clamp(2rem,3.1vw,2.9rem)] font-extrabold leading-tight text-white">{{ cta?.title }}</h2>
    <p v-if="cta?.description" class="relative z-[1] mx-auto mt-4 max-w-[42rem] text-[1rem] leading-8 text-slate-200">{{ cta.description }}</p>

    <NuxtLink
      v-if="cta?.button?.label && !isExternal"
      :to="buttonHref"
      class="cta-button mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold text-[#00261c]"
      :target="cta?.button?.newTab ? '_blank' : undefined"
      :rel="cta?.button?.newTab ? 'noopener noreferrer' : undefined"
    >
      {{ cta.button.label }}
      <span aria-hidden="true">&rarr;</span>
    </NuxtLink>
    <a
      v-else-if="cta?.button?.label"
      :href="buttonHref"
      class="cta-button mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-semibold text-[#00261c]"
      :target="cta?.button?.newTab ? '_blank' : undefined"
      :rel="cta?.button?.newTab ? 'noopener noreferrer' : undefined"
    >
      {{ cta.button.label }}
      <span aria-hidden="true">&rarr;</span>
    </a>
  </div>
</template>

<style scoped>
.cta-shell {
  border: 1px solid rgba(109, 198, 168, 0.24);
  background:
    radial-gradient(circle at 10% 12%, rgba(0, 108, 79, 0.3), transparent 34%),
    linear-gradient(145deg, #001c2a 6%, #002f45 52%, #004f3a 100%);
  box-shadow: 0 18px 36px rgba(0, 28, 42, 0.2);
}

.cta-button {
  background: #67fcc6;
}

.cta-button:focus-visible {
  outline: 2px solid #67fcc6;
  outline-offset: 3px;
}
</style>
