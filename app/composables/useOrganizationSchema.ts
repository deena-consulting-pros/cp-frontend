import { buildOrganizationSchema, normalizeAbsoluteUrl, sanitizeSchemaUrl } from '~/utils/schema'

export const useOrganizationSchema = () => {
  const defaults = useSeoDefaults()
  const requestUrl = useRequestURL()
  const { resolveImageUrl } = useStrapi()

  const siteUrl = computed(() =>
    normalizeAbsoluteUrl(defaults.siteUrl)
    || normalizeAbsoluteUrl(requestUrl.origin)
    || 'http://localhost:3000',
  )
  const siteName = computed(() => defaults.siteName || 'Consulting Pros FZC')

  const logoUrl = computed(() =>
    sanitizeSchemaUrl(resolveImageUrl(defaults.siteLogo, siteUrl.value), siteUrl.value),
  )

  const sameAs = computed(() =>
    defaults.siteSameAs
      .map((url) => sanitizeSchemaUrl(url, siteUrl.value, { allowExternal: true }))
      .filter(Boolean),
  )

  const normalizedAddressCountry = computed(() => {
    const code = defaults.businessAddressCountry.trim().toUpperCase()
    if (code === 'AE' || code === 'ARE' || code === 'UNITED ARAB EMIRATES' || code === 'UAE') {
      return 'AE'
    }
    return code.length === 2 ? code : ''
  })

  const hasAddress = computed(() =>
    Boolean(
      defaults.businessStreetAddress.trim()
        || defaults.businessAddressLocality.trim()
        || defaults.businessAddressRegion.trim()
        || defaults.businessPostalCode.trim()
        || normalizedAddressCountry.value,
    ),
  )

  const organizationSchema = computed(() =>
    buildOrganizationSchema({
      siteUrl: siteUrl.value,
      name: siteName.value,
      logo: logoUrl.value || undefined,
      description: defaults.siteDescription || undefined,
      slogan: defaults.siteSlogan || undefined,
      sameAs: sameAs.value,
      email: defaults.supportEmail || undefined,
      telephone: defaults.supportPhone || undefined,
      supportEmail: defaults.supportEmail || undefined,
      supportPhone: defaults.supportPhone || undefined,
      address: hasAddress.value
        ? {
            streetAddress: defaults.businessStreetAddress || undefined,
            addressLocality: defaults.businessAddressLocality || undefined,
            addressRegion: defaults.businessAddressRegion || undefined,
            postalCode: defaults.businessPostalCode || undefined,
            addressCountry: normalizedAddressCountry.value || undefined,
          }
        : undefined,
    }),
  )

  return {
    organizationSchema,
    siteUrl,
    siteName,
  }
}
