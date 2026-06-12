import type { JsonLdRecord } from '~/utils/schema'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

const cleanSchemaValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => cleanSchemaValue(item))
      .filter((item) => item !== undefined)
    return cleaned.length ? cleaned : undefined
  }

  if (value && typeof value === 'object') {
    const cleanedEntries = Object.entries(value as Record<string, unknown>)
      .map(([key, nestedValue]) => [key, cleanSchemaValue(nestedValue)] as const)
      .filter(([, nestedValue]) => nestedValue !== undefined)

    if (!cleanedEntries.length) {
      return undefined
    }

    return Object.fromEntries(cleanedEntries)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : undefined
  }

  if (value === null) {
    return undefined
  }

  return value
}

export const useJsonLd = (schemas: MaybeRefOrGetter<JsonLdRecord | JsonLdRecord[]>) => {
  const serialized = computed(() => {
    const resolvedSchemas = toValue(schemas)
    const schemaList = (Array.isArray(resolvedSchemas) ? resolvedSchemas : [resolvedSchemas])
      .map((schema) => cleanSchemaValue(schema))
      .filter((schema): schema is JsonLdRecord => Boolean(schema))
    const seen = new Set<string>()
    const deduped = schemaList.filter((schema) => {
      const schemaId = typeof schema['@id'] === 'string' ? schema['@id'] : ''
      const serializedSchema = JSON.stringify(schema)
      const dedupeKey = schemaId || serializedSchema
      if (seen.has(dedupeKey)) {
        return false
      }
      seen.add(dedupeKey)
      return true
    })

    if (!deduped.length) {
      return ''
    }

    const graph = deduped.map((schema) => {
      const { ['@context']: _context, ...rest } = schema
      return rest
    })
    const payload = deduped.length === 1
      ? deduped[0]
      : { '@context': 'https://schema.org', '@graph': graph }
    return JSON.stringify(payload)
  })

  useHead(() => {
    if (!serialized.value) {
      return {}
    }

    return {
      script: [{
        key: 'jsonld:graph',
        type: 'application/ld+json',
        innerHTML: serialized.value
      }]
    }
  })
}
