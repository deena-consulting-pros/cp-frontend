<script setup lang="ts">
import type { HomepageData } from '~/types/homepage'

type FaqHeading = HomepageData['faqHeading']
type FaqItem = HomepageData['faqs'][number]

const fallbackHeading: FaqHeading = {
  label: '',
  title: 'Frequently Asked Questions',
  highlightText: '',
  subtitle: '',
  alignment: 'center'
}

const fallbackFaqs: FaqItem[] = [
  {
    id: 'homepage-faq-fallback-1',
    question: 'What services does Consulting Pros offer?',
    answer: 'We provide end-to-end digital consulting including SEO, paid advertising, web design and development, content strategy, and conversion optimization tailored to your business goals.'
  },
  {
    id: 'homepage-faq-fallback-2',
    question: 'How quickly can we start working together?',
    answer: 'After an initial discovery call, we typically kick off projects within one to two weeks with a clear roadmap, milestones, and communication plan.'
  },
  {
    id: 'homepage-faq-fallback-3',
    question: 'Do you work with businesses outside the UAE?',
    answer: 'Yes. While we are based in the UAE, we collaborate with clients across regions and time zones using structured remote workflows.'
  },
  {
    id: 'homepage-faq-fallback-4',
    question: 'How do you measure success?',
    answer: 'We define KPIs at the start of every engagement and report on the metrics that matter most to your business, from traffic and leads to revenue and ROI.'
  }
]

const props = withDefaults(defineProps<{
  heading?: FaqHeading | null
  faqs?: FaqItem[]
}>(), {
  heading: () => ({ label: '', title: '', highlightText: '', subtitle: '', alignment: 'center' }),
  faqs: () => []
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let sectionObserver: IntersectionObserver | null = null

const openItemId = ref('')
const visibleFaqs = computed<FaqItem[]>(() => {
  const normalized = [...(props.faqs || [])]
    .filter((item) => item?.question && item?.answer)
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
  return normalized.length ? normalized : fallbackFaqs
})

const normalizedHeading = computed<FaqHeading>(() => {
  const source = props.heading || fallbackHeading
  return {
    label: source.label || fallbackHeading.label,
    title: source.title || fallbackHeading.title,
    highlightText: source.highlightText || fallbackHeading.highlightText,
    subtitle: source.subtitle || fallbackHeading.subtitle,
    alignment: source.alignment || fallbackHeading.alignment
  }
})

const sectionTitleId = 'homepage-faq-title'

const itemId = (faq: FaqItem, index: number) => faq.id || `homepage-faq-item-${index}`
const buttonId = (faq: FaqItem, index: number) => `homepage-faq-trigger-${itemId(faq, index)}`
const panelId = (faq: FaqItem, index: number) => `homepage-faq-panel-${itemId(faq, index)}`
const isOpen = (faq: FaqItem, index: number) => openItemId.value === itemId(faq, index)

const toggle = (faq: FaqItem, index: number) => {
  const id = itemId(faq, index)
  openItemId.value = openItemId.value === id ? '' : id
}

watch(visibleFaqs, (nextFaqs) => {
  if (!nextFaqs.length) {
    openItemId.value = ''
    return
  }
  const activeExists = nextFaqs.some((faq, index) => itemId(faq, index) === openItemId.value)
  if (!activeExists) {
    const firstFaq = nextFaqs[0]
    openItemId.value = firstFaq ? itemId(firstFaq, 0) : ''
  }
}, { immediate: true })

onMounted(() => {
  if (!sectionRef.value) {
    isVisible.value = true
    return
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isVisible.value = true
    return
  }

  sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      isVisible.value = true
      sectionObserver?.disconnect()
      sectionObserver = null
    })
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -8% 0px'
  })

  sectionObserver.observe(sectionRef.value)
})

onBeforeUnmount(() => {
  sectionObserver?.disconnect()
  sectionObserver = null
})
</script>

<template>
  <section ref="sectionRef" class="faq-reveal w-full overflow-x-clip" :class="{ 'is-visible': isVisible }" :aria-labelledby="sectionTitleId">
    <SectionHeading
      :id="sectionTitleId"
      :heading="normalizedHeading"
      :alignment="normalizedHeading.alignment as 'left' | 'center' | 'right' | ''"
      margin-bottom-class="mb-8 md:mb-10"
      max-width="max-w-[48rem]"
    />

    <div class="mx-auto w-full max-w-[52rem] space-y-4">
      <article
        v-for="(faq, index) in visibleFaqs"
        :key="itemId(faq, index)"
        class="overflow-hidden rounded-3xl border border-[#d7e3eb] bg-white shadow-[0_12px_32px_rgba(0,28,42,0.08)]"
      >
        <h3>
          <button
            type="button"
            class="faq-trigger"
            :id="buttonId(faq, index)"
            :aria-expanded="isOpen(faq, index)"
            :aria-controls="panelId(faq, index)"
            @click="toggle(faq, index)"
          >
            <span class="faq-question">{{ faq.question }}</span>
            <span class="faq-icon-wrap" :class="{ 'is-open': isOpen(faq, index) }" aria-hidden="true">
              <svg class="faq-icon" viewBox="0 0 16 16" fill="none">
                <path d="M3 6.5L8 11L13 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </button>
        </h3>

        <div
          :id="panelId(faq, index)"
          class="faq-panel"
          role="region"
          :aria-labelledby="buttonId(faq, index)"
          :data-open="isOpen(faq, index)"
        >
          <p class="faq-answer">
            {{ faq.answer }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.faq-trigger {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.2rem;
  text-align: left;
  color: #001c2a;
}

.faq-question {
  font-size: 1.03rem;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: -0.005em;
}

.faq-icon-wrap {
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e8f8f1;
  color: #006c4f;
  transition: transform 0.22s ease;
}

.faq-icon-wrap.is-open {
  transform: rotate(180deg);
}

.faq-icon {
  height: 1rem;
  width: 1rem;
}

.faq-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.24s ease;
}

.faq-panel[data-open='true'] {
  grid-template-rows: 1fr;
}

.faq-answer {
  min-height: 0;
  overflow: hidden;
  border-top: 1px solid #e1eaf0;
  padding: 0 1.2rem;
  color: #385163;
  font-size: 0.99rem;
  line-height: 1.8;
}

.faq-panel[data-open='true'] .faq-answer {
  padding-top: 0.85rem;
  padding-bottom: 1.05rem;
}

@media (min-width: 640px) {
  .faq-trigger {
    padding: 1.3rem 1.4rem;
  }

  .faq-answer {
    padding-left: 1.4rem;
    padding-right: 1.4rem;
  }
}

.faq-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 600ms ease, transform 600ms ease;
}

.faq-reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .faq-panel,
  .faq-icon-wrap,
  .faq-reveal {
    transition: none;
  }

  .faq-reveal {
    opacity: 1;
    transform: none;
  }
}
</style>
