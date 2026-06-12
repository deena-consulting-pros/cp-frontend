<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface StrapiMediaShape {
  url?: string | null
  alternativeText?: string | null
  data?: {
    url?: string | null
    alternativeText?: string | null
    attributes?: {
      url?: string | null
      alternativeText?: string | null
    } | null
  } | null
}

interface NavLink {
  id?: number | string
  label?: string | null
  url?: string | null
  newTab?: boolean | null
}

interface NavbarData {
  logo?: StrapiMediaShape | string | null
  siteName?: string | null
  navLinks?: NavLink[] | null
  ctaLink?: NavLink | null
  showCta?: boolean | null
}

interface GlobalData {
  siteName?: string | null
  navbar?: NavbarData | null
  attributes?: GlobalData | null
}

interface GlobalResponse {
  data?: GlobalData | null
}

const fallbackLinks: Array<{ label: string; url: string; newTab: boolean }> = [
  { label: 'Home', url: '/', newTab: false },
  { label: 'About Us', url: '/about', newTab: false },
  { label: 'Services', url: '/services', newTab: false },
  { label: 'Process', url: '/#process', newTab: false },
  { label: 'Portfolio', url: '/#portfolio', newTab: false },
  { label: 'Contact', url: '/contact', newTab: false }
]

const fallbackCta: { label: string; url: string; newTab: boolean } = {
  label: 'Get Free Consultation',
  url: '/contact',
  newTab: false
}

const route = useRoute()
const { buildApiUrl, toMediaUrl } = useStrapi()
const config = useRuntimeConfig()

const mobileMenuOpen = ref(false)

const endpoint = buildApiUrl('/api/global?populate[navbar][populate]=*')
const { data } = await useAsyncData<GlobalResponse | null>('global-navbar', async () => {
  try {
    return await $fetch<GlobalResponse>(endpoint)
  } catch {
    return null
  }
}, {
  server: true,
  default: () => null
})

const mergedGlobal = computed<GlobalData>(() => {
  const entry = data.value?.data
  if (!entry) {
    return {}
  }

  if (!entry.attributes) {
    return entry
  }

  return {
    ...entry.attributes,
    ...entry
  }
})

const navbar = computed<NavbarData>(() => mergedGlobal.value.navbar || {})

const brandName = computed(() => {
  const navbarName = navbar.value.siteName?.trim()
  const globalName = mergedGlobal.value.siteName?.trim()
  const runtimeName = config.public.siteName?.trim()
  return navbarName || globalName || runtimeName || 'Consulting Pros FZC'
})

const logoSource = computed(() => {
  const media = navbar.value.logo
  if (!media) {
    return ''
  }

  if (typeof media === 'string') {
    return toMediaUrl(media)
  }

  const mediaUrl = media.url || media.data?.url || media.data?.attributes?.url || ''
  return toMediaUrl(mediaUrl)
})

const logoAlt = computed(() => {
  const media = navbar.value.logo
  if (!media || typeof media === 'string') {
    return `${brandName.value} logo`
  }

  return media.alternativeText || media.data?.alternativeText || media.data?.attributes?.alternativeText || `${brandName.value} logo`
})

const normalizedNavLinks = computed(() => {
  const links = Array.isArray(navbar.value.navLinks) && navbar.value.navLinks.length ? navbar.value.navLinks : fallbackLinks

  return links
    .map((link) => ({
      label: typeof link.label === 'string' ? link.label.trim() : '',
      url: typeof link.url === 'string' ? link.url.trim() : '',
      newTab: Boolean(link.newTab)
    }))
    .filter((link) => link.label && link.url)
})

const showCta = computed(() => {
  if (typeof navbar.value.showCta === 'boolean') {
    return navbar.value.showCta
  }

  return true
})

const ctaLink = computed(() => {
  const cta = navbar.value.ctaLink
  if (!cta?.label || !cta?.url) {
    return fallbackCta
  }

  return {
    label: cta.label.trim(),
    url: cta.url.trim(),
    newTab: Boolean(cta.newTab)
  }
})

const isExternalUrl = (url: string) => /^(https?:)?\/\//i.test(url) || url.startsWith('mailto:') || url.startsWith('tel:')
const isInternalUrl = (url: string) => !isExternalUrl(url)

const isLinkActive = (url: string) => {
  if (!isInternalUrl(url)) {
    return false
  }

  if (url === '/') {
    return route.path === '/'
  }

  if (url.startsWith('/#')) {
    return route.path === '/'
  }

  return route.path === url
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMobileMenu()
  }
}

watch(() => route.fullPath, () => {
  closeMobileMenu()
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <header class="fixed top-0 right-0 left-0 z-50 border-b border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-xl">
    <div class="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
      <NuxtLink to="/" class="flex min-w-0 items-center gap-3 text-[#001c2a]">
        <img
          v-if="logoSource"
          :src="logoSource"
          :alt="logoAlt"
          class="h-9 w-auto max-w-[132px] object-contain"
          loading="eager"
          decoding="async"
        />
        <span class="truncate text-sm font-bold tracking-[0.01em] sm:text-base">{{ brandName }}</span>
      </NuxtLink>

      <nav class="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
        <template v-for="link in normalizedNavLinks" :key="`${link.label}-${link.url}`">
          <NuxtLink
            v-if="isInternalUrl(link.url)"
            :to="link.url"
            class="group relative py-1 text-sm font-semibold transition-colors duration-300"
            :class="isLinkActive(link.url) ? 'text-[#001c2a]' : 'text-slate-600 hover:text-[#006c4f]'"
          >
            {{ link.label }}
            <span class="pointer-events-none absolute -bottom-0.5 left-0 h-0.5 w-full origin-left scale-x-0 bg-[#006c4f] transition-transform duration-300 group-hover:scale-x-100" :class="isLinkActive(link.url) ? 'scale-x-100' : ''" />
          </NuxtLink>
          <a
            v-else
            :href="link.url"
            :target="link.newTab ? '_blank' : undefined"
            :rel="link.newTab ? 'noopener noreferrer' : undefined"
            class="group relative py-1 text-sm font-semibold text-slate-600 transition-colors duration-300 hover:text-[#006c4f]"
          >
            {{ link.label }}
            <span class="pointer-events-none absolute -bottom-0.5 left-0 h-0.5 w-full origin-left scale-x-0 bg-[#006c4f] transition-transform duration-300 group-hover:scale-x-100" />
          </a>
        </template>
      </nav>

      <div class="hidden lg:block">
        <NuxtLink
          v-if="showCta && isInternalUrl(ctaLink.url)"
          :to="ctaLink.url"
          class="inline-flex items-center rounded-full bg-[#001c2a] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#006c4f] hover:shadow-md"
        >
          {{ ctaLink.label }}
        </NuxtLink>
        <a
          v-else-if="showCta"
          :href="ctaLink.url"
          :target="ctaLink.newTab ? '_blank' : undefined"
          :rel="ctaLink.newTab ? 'noopener noreferrer' : undefined"
          class="inline-flex items-center rounded-full bg-[#001c2a] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#006c4f] hover:shadow-md"
        >
          {{ ctaLink.label }}
        </a>
      </div>

      <button
        class="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-[#001c2a] transition-colors duration-300 hover:bg-slate-100 lg:hidden"
        type="button"
        :aria-expanded="mobileMenuOpen ? 'true' : 'false'"
        aria-controls="mobile-menu"
        aria-label="Toggle menu"
        @click="toggleMobileMenu"
      >
        <span class="sr-only">Toggle navigation menu</span>
        <span class="relative block h-5 w-6">
          <span
            class="absolute top-1 left-0 h-0.5 w-6 bg-current transition-all duration-300"
            :class="mobileMenuOpen ? 'top-2.5 rotate-45' : ''"
          />
          <span
            class="absolute top-2.5 left-0 h-0.5 w-6 bg-current transition-all duration-300"
            :class="mobileMenuOpen ? 'opacity-0' : ''"
          />
          <span
            class="absolute top-4 left-0 h-0.5 w-6 bg-current transition-all duration-300"
            :class="mobileMenuOpen ? 'top-2.5 -rotate-45' : ''"
          />
        </span>
      </button>
    </div>

    <Transition name="mobile-menu">
      <div
        v-if="mobileMenuOpen"
        id="mobile-menu"
        class="overflow-x-hidden border-t border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl lg:hidden"
      >
        <nav class="mx-auto flex w-full max-w-[1440px] flex-col gap-1 px-4 py-4 sm:px-6" aria-label="Mobile navigation">
          <template v-for="link in normalizedNavLinks" :key="`mobile-${link.label}-${link.url}`">
            <NuxtLink
              v-if="isInternalUrl(link.url)"
              :to="link.url"
              class="rounded-lg px-3 py-3 text-sm font-semibold transition-colors duration-200"
              :class="isLinkActive(link.url) ? 'bg-slate-100 text-[#001c2a]' : 'text-slate-700 hover:bg-slate-50 hover:text-[#006c4f]'"
              @click="closeMobileMenu"
            >
              {{ link.label }}
            </NuxtLink>
            <a
              v-else
              :href="link.url"
              :target="link.newTab ? '_blank' : undefined"
              :rel="link.newTab ? 'noopener noreferrer' : undefined"
              class="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-50 hover:text-[#006c4f]"
              @click="closeMobileMenu"
            >
              {{ link.label }}
            </a>
          </template>

          <NuxtLink
            v-if="showCta && isInternalUrl(ctaLink.url)"
            :to="ctaLink.url"
            class="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#001c2a] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-[#006c4f]"
            @click="closeMobileMenu"
          >
            {{ ctaLink.label }}
          </NuxtLink>
          <a
            v-else-if="showCta"
            :href="ctaLink.url"
            :target="ctaLink.newTab ? '_blank' : undefined"
            :rel="ctaLink.newTab ? 'noopener noreferrer' : undefined"
            class="mt-3 inline-flex w-full items-center justify-center rounded-full bg-[#001c2a] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-[#006c4f]"
            @click="closeMobileMenu"
          >
            {{ ctaLink.label }}
          </a>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 240ms ease, transform 240ms ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (prefers-reduced-motion: reduce) {
  .mobile-menu-enter-active,
  .mobile-menu-leave-active {
    transition: none;
  }
}
</style>
