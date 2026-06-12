<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        heading?: string;
        items?: Array<{ id: string; question: string; answer: string }>;
    }>(),
    {
        heading: "Frequently asked questions",
        items: () => [],
    },
);

const openId = ref("");

const resolvedItems = computed(() =>
    props.items.filter((item) => item.question && item.answer),
);

watch(
    resolvedItems,
    (items) => {
        if (!items.length) {
            openId.value = "";
            return;
        }

        if (!items.some((item) => item.id === openId.value)) {
            openId.value = items[0]?.id || "";
        }
    },
    { immediate: true },
);

const isOpen = (id: string) => openId.value === id;

const toggle = (id: string) => {
    openId.value = openId.value === id ? "" : id;
};
</script>

<template>
    <section class="w-full" aria-labelledby="service-faq-heading">
        <div class="mx-auto max-w-[860px]">
            <h2 id="service-faq-heading" class="section-title text-center">
                {{ heading }}
            </h2>
            <div class="mt-10 space-y-4">
                <article
                    v-for="item in resolvedItems"
                    :key="item.id"
                    class="overflow-hidden rounded-2xl border border-[#d7e3eb] bg-white shadow-sm"
                >
                    <h3 class="text-base leading-none">
                        <button
                            type="button"
                            class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                            :aria-expanded="isOpen(item.id)"
                            :aria-controls="`faq-panel-${item.id}`"
                            :id="`faq-trigger-${item.id}`"
                            @click="toggle(item.id)"
                        >
                            <span
                                class="text-[1.02rem] font-bold text-[#001c2a]"
                                >{{ item.question }}</span
                            >
                            <span
                                class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f8f1] text-[#006c4f] transition-transform duration-200"
                                :class="{ 'rotate-180': isOpen(item.id) }"
                                aria-hidden="true"
                            >
                                <svg
                                    viewBox="0 0 16 16"
                                    class="h-4 w-4"
                                    fill="none"
                                >
                                    <path
                                        d="M3 6.5L8 11L13 6.5"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </span>
                        </button>
                    </h3>

                    <div
                        :id="`faq-panel-${item.id}`"
                        role="region"
                        :aria-labelledby="`faq-trigger-${item.id}`"
                        class="grid transition-[grid-template-rows] duration-200"
                        :class="
                            isOpen(item.id)
                                ? 'grid-rows-[1fr]'
                                : 'grid-rows-[0fr]'
                        "
                    >
                        <p
                            class="min-h-0 overflow-hidden border-t border-[#e1eaf0] px-6 text-[0.98rem] leading-7 text-[#385163]"
                            :class="isOpen(item.id) ? 'py-4' : 'py-0'"
                        >
                            {{ item.answer }}
                        </p>
                    </div>
                </article>
            </div>
        </div>
    </section>
</template>
