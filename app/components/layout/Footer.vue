<script setup lang="ts">
import { computed } from 'vue'
import type { StrapiMedia } from '~/types/global'

interface FooterLinkItem {
  id?: number | string
  platform?: string | null
  icon?: string | null
  label?: string | null
  url?: string | null
  newTab?: boolean | null
}

interface FooterData {
  logo?: StrapiMedia | string | null
  siteName?: string | null
  description?: string | null
  quickLinks?: FooterLinkItem[] | null
  serviceLinks?: FooterLinkItem[] | null
  legalLinks?: FooterLinkItem[] | null
  socialLinks?: FooterLinkItem[] | null
  copyrightText?: string | null
}

interface GlobalData {
  siteName?: string | null
  siteDescription?: string | null
  siteLogo?: StrapiMedia | string | null
  supportEmail?: string | null
  supportPhone?: string | null
  sameAs?: Array<string | FooterLinkItem> | null
  footer?: FooterData | null
  attributes?: GlobalData | null
}

interface GlobalResponse {
  data?: GlobalData | null
}

const { buildApiUrl, toMediaUrl } = useStrapi()
const config = useRuntimeConfig()
const currentYear = new Date().getFullYear()

const pickText = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return ''
}

const readMediaUrl = (media?: StrapiMedia | string | null) => {
  if (!media) return ''
  if (typeof media === 'string') return media.trim()
  return pickText(media.url, media.data?.url, media.data?.attributes?.url)
}

const readMediaAlt = (media?: StrapiMedia | string | null) => {
  if (!media || typeof media === 'string') return ''
  return pickText(media.alternativeText, media.data?.alternativeText, media.data?.attributes?.alternativeText)
}

const normalizeLink = (value?: string | null) => {
  if (!value || typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^(https?:|mailto:|tel:|#)/i.test(trimmed)) return trimmed
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

const isExternalUrl = (url: string) => /^(https?:)?\/\//i.test(url) || url.startsWith('mailto:') || url.startsWith('tel:')
const isInternalUrl = (url: string) => !isExternalUrl(url)
const shouldOpenInNewTab = (url: string, newTab?: boolean) => Boolean(newTab) || isExternalUrl(url)

const toNormalizedLinks = (value?: FooterLinkItem[] | null) => {
  if (!Array.isArray(value)) return []
  return value
    .map((link) => ({
      platform: pickText(link.icon, link.platform),
      label: pickText(link.label, link.platform, link.icon),
      url: normalizeLink(link.url),
      newTab: Boolean(link.newTab)
    }))
    .filter((link) => link.label && link.url)
}

const normalizeSameAsLinks = (value?: Array<string | FooterLinkItem> | null) => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === 'string') {
        const url = normalizeLink(item)
        if (!url) return null
        const clean = url.replace(/^https?:\/\//i, '').replace(/^www\./i, '')
        const hostname = clean.split('/')[0] ?? ''
        const base = hostname.split('.')[0]
        return {
          platform: '',
          label: base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Social',
          url,
          newTab: true
        }
      }

      const url = normalizeLink(item?.url)
      if (!url) return null
      const explicitLabel = pickText(item.label, item.platform, item.icon)
      const clean = url.replace(/^https?:\/\//i, '').replace(/^www\./i, '')
      const hostname = clean.split('/')[0] ?? ''
      const base = hostname.split('.')[0]
      return {
        platform: pickText(item.icon, item.platform),
        label: explicitLabel || (base ? base.charAt(0).toUpperCase() + base.slice(1) : 'Social'),
        url,
        newTab: typeof item.newTab === 'boolean' ? item.newTab : true
      }
    })
    .filter((item): item is { platform: string, label: string, url: string, newTab: boolean } => Boolean(item))
}

const endpoint = buildApiUrl('/api/global?populate[footer][populate]=*&populate[siteLogo][populate]=*')
const { data } = await useAsyncData<GlobalResponse | null>('global-footer', async () => {
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
  if (!entry) return {}
  if (!entry.attributes) return entry
  return { ...entry.attributes, ...entry }
})

const footerData = computed<FooterData>(() => mergedGlobal.value.footer || {})

const brandName = computed(() => pickText(
  footerData.value.siteName,
  mergedGlobal.value.siteName,
  config.public.siteName,
  'Consulting Pros FZC'
))

const brandDescription = computed(() => pickText(
  footerData.value.description,
  mergedGlobal.value.siteDescription
))

const logoMedia = computed(() => footerData.value.logo || mergedGlobal.value.siteLogo || null)
const logoSource = computed(() => toMediaUrl(readMediaUrl(logoMedia.value)))
const logoAlt = computed(() => readMediaAlt(logoMedia.value) || `${brandName.value} logo`)

const serviceLinks = computed(() => toNormalizedLinks(footerData.value.serviceLinks))
const quickLinks = computed(() => toNormalizedLinks(footerData.value.quickLinks))

const legalLinks = computed(() => {
  const base = toNormalizedLinks(footerData.value.legalLinks)
  if (base.length) return base

  const fallback: Array<{ label: string, url: string, newTab: boolean }> = []
  const supportEmail = pickText(mergedGlobal.value.supportEmail)
  const supportPhone = pickText(mergedGlobal.value.supportPhone)

  if (supportEmail) fallback.push({ label: supportEmail, url: `mailto:${supportEmail}`, newTab: false })
  if (supportPhone) fallback.push({ label: supportPhone, url: `tel:${supportPhone}`, newTab: false })
  return fallback
})

const socialLinks = computed(() => {
  const base = toNormalizedLinks(footerData.value.socialLinks)
  if (base.length) return base
  return normalizeSameAsLinks(mergedGlobal.value.sameAs)
})

const copyrightText = computed(() => pickText(
  footerData.value.copyrightText,
  `© ${currentYear} ${brandName.value}. All rights reserved.`
))

</script>

<template>
  <footer class="border-t border-slate-200 bg-white">
    <div class="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-20 sm:px-6 md:pt-24 lg:px-8">
      <div class="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 xl:grid-cols-5">
        <div class="xl:col-span-2">
          <NuxtLink to="/" class="inline-flex items-center gap-3 text-[#001c2a]">
            <img
              v-if="logoSource"
              :src="logoSource"
              :alt="logoAlt"
              class="h-10 w-auto max-w-[144px] object-contain"
              loading="lazy"
              decoding="async"
            />
            <span class="text-base font-bold tracking-[0.01em] sm:text-lg">{{ brandName }}</span>
          </NuxtLink>
          <p v-if="brandDescription" class="mt-5 max-w-[28rem] text-sm leading-7 text-slate-600 sm:text-base">
            {{ brandDescription }}
          </p>

          <div v-if="socialLinks.length" class="mt-8">
            <p class="text-xs font-semibold tracking-[0.2em] text-[#001c2a]">FOLLOW US</p>
          </div>
          <nav v-if="socialLinks.length" class="mt-5 flex flex-wrap items-center gap-3" aria-label="Footer social links">
            <template v-for="item in socialLinks" :key="`social-chip-${item.label}-${item.url}`">
              <NuxtLink
                v-if="isInternalUrl(item.url) && !item.newTab"
                :to="item.url"
                :aria-label="item.platform || item.label"
                class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-300 hover:bg-[#001c2a] hover:text-white"
              >
                <SocialIcon
                  :name="item.platform || item.label"
                  :url="item.url"
                  class="h-5 w-5"
                />
              </NuxtLink>
              <a
                v-else
                :href="item.url"
                :target="shouldOpenInNewTab(item.url, item.newTab) ? '_blank' : undefined"
                :rel="shouldOpenInNewTab(item.url, item.newTab) ? 'noopener noreferrer' : undefined"
                :aria-label="item.platform || item.label"
                class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-300 hover:bg-[#001c2a] hover:text-white"
              >
                <SocialIcon
                  :name="item.platform || item.label"
                  :url="item.url"
                  class="h-5 w-5"
                />
              </a>
            </template>
          </nav>
        </div>

        <nav aria-label="Services footer links">
          <p class="text-xs font-semibold tracking-[0.2em] text-[#001c2a]">SERVICES</p>
          <ul class="mt-5 space-y-3">
            <li v-for="item in serviceLinks" :key="`service-${item.label}-${item.url}`">
              <NuxtLink
                v-if="isInternalUrl(item.url) && !item.newTab"
                :to="item.url"
                class="group inline-flex items-center gap-1.5 text-sm text-slate-600 transition-all duration-300 hover:translate-x-0.5 hover:text-[#006c4f]"
              >
                {{ item.label }}
                <span class="h-px w-0 bg-[#006c4f] transition-all duration-300 group-hover:w-3" />
              </NuxtLink>
              <a
                v-else
                :href="item.url"
                :target="item.newTab ? '_blank' : undefined"
                :rel="item.newTab ? 'noopener noreferrer' : undefined"
                class="group inline-flex items-center gap-1.5 text-sm text-slate-600 transition-all duration-300 hover:translate-x-0.5 hover:text-[#006c4f]"
              >
                {{ item.label }}
                <span class="h-px w-0 bg-[#006c4f] transition-all duration-300 group-hover:w-3" />
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-label="Company footer links">
          <p class="text-xs font-semibold tracking-[0.2em] text-[#001c2a]">COMPANY</p>
          <ul class="mt-5 space-y-3">
            <li v-for="item in quickLinks" :key="`quick-${item.label}-${item.url}`">
              <NuxtLink
                v-if="isInternalUrl(item.url) && !item.newTab"
                :to="item.url"
                class="group inline-flex items-center gap-1.5 text-sm text-slate-600 transition-all duration-300 hover:translate-x-0.5 hover:text-[#006c4f]"
              >
                {{ item.label }}
                <span class="h-px w-0 bg-[#006c4f] transition-all duration-300 group-hover:w-3" />
              </NuxtLink>
              <a
                v-else
                :href="item.url"
                :target="item.newTab ? '_blank' : undefined"
                :rel="item.newTab ? 'noopener noreferrer' : undefined"
                class="group inline-flex items-center gap-1.5 text-sm text-slate-600 transition-all duration-300 hover:translate-x-0.5 hover:text-[#006c4f]"
              >
                {{ item.label }}
                <span class="h-px w-0 bg-[#006c4f] transition-all duration-300 group-hover:w-3" />
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-label="Support footer links">
          <p class="text-xs font-semibold tracking-[0.2em] text-[#001c2a]">SUPPORT</p>
          <ul class="mt-5 space-y-3">
            <li v-for="item in legalLinks" :key="`legal-${item.label}-${item.url}`">
              <NuxtLink
                v-if="isInternalUrl(item.url) && !item.newTab"
                :to="item.url"
                class="group inline-flex items-center gap-1.5 text-sm text-slate-600 transition-all duration-300 hover:translate-x-0.5 hover:text-[#006c4f]"
              >
                {{ item.label }}
                <span class="h-px w-0 bg-[#006c4f] transition-all duration-300 group-hover:w-3" />
              </NuxtLink>
              <a
                v-else
                :href="item.url"
                :target="item.newTab ? '_blank' : undefined"
                :rel="item.newTab ? 'noopener noreferrer' : undefined"
                class="group inline-flex items-center gap-1.5 text-sm text-slate-600 transition-all duration-300 hover:translate-x-0.5 hover:text-[#006c4f]"
              >
                {{ item.label }}
                <span class="h-px w-0 bg-[#006c4f] transition-all duration-300 group-hover:w-3" />
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div class="mt-14 border-t border-slate-200 pt-6">
        <p class="text-center text-xs text-slate-500 sm:text-sm">{{ copyrightText }}</p>
      </div>
    </div>
  </footer>
</template>


