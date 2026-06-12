<script setup lang="ts">
withDefaults(
    defineProps<{
        services?: Array<{
            id: string;
            title: string;
            description: string;
            href: string;
            image?: string;
        }>;
    }>(),
    {
        services: () => [],
    },
);
</script>

<template>
    <section class="w-full" aria-labelledby="related-services-heading">
        <h2 id="related-services-heading" class="section-title text-center">
            Related Services
        </h2>
        <div class="mt-10 grid gap-8 md:grid-cols-3">
            <NuxtLink
                v-for="(service, index) in services"
                :key="service.id"
                :to="service.href"
                class="group block"
            >
                <div
                    class="relative mb-5 h-56 overflow-hidden rounded-2xl sm:h-64"
                >
                    <div
                        class="absolute inset-0 z-10 bg-[#001c2a]/20 transition-colors duration-300 group-hover:bg-[#001c2a]/10"
                    ></div>
                    <img
                        v-if="service.image"
                        :src="service.image"
                        :alt="service.title"
                        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                    <div
                        v-else
                        class="h-full w-full"
                        :class="
                            index % 3 === 0
                                ? 'bg-[#c8d5df]'
                                : index % 3 === 1
                                  ? 'bg-[#a4cce6]'
                                  : 'bg-[#94b8c8]'
                        "
                    ></div>
                </div>
                <h3 class="text-xl font-bold text-[#001c2a]">
                    {{ service.title }}
                </h3>
                <p class="mt-2 text-base leading-6 text-[#41484c]">
                    {{ service.description }}
                </p>
                <span
                    class="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#006c4f] transition-all duration-300 group-hover:gap-3"
                >
                    Explore Service
                    <svg
                        class="h-4 w-4"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                </span>
            </NuxtLink>
        </div>
    </section>
</template>
