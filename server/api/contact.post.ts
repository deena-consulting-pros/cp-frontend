import { createError, getRequestHeader, readBody } from 'h3'

type ContactBody = {
  fullName?: unknown
  businessEmail?: unknown
  phoneNumber?: unknown
  companyWebsite?: unknown
  serviceInterest?: unknown
  message?: unknown
  website?: unknown
  sourcePage?: unknown
}

const MAX_FULL_NAME = 120
const MAX_EMAIL = 254
const MAX_PHONE = 25
const MAX_WEBSITE = 255
const MAX_SERVICE_INTEREST = 120
const MAX_MESSAGE = 2000
const MAX_SOURCE_PAGE = 120

const trimToString = (value: unknown) => {
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

const clamp = (value: string, maxLength: number) => value.slice(0, maxLength)
const PHONE_PATTERN = /^[0-9+\-()\s]+$/

const getSourcePage = (provided: unknown, refererHeader: string) => {
  const source = trimToString(provided)
  const fallback = trimToString(refererHeader)
  const raw = source || fallback

  if (!raw) {
    return '/contact'
  }

  try {
    const parsed = new URL(raw)
    return clamp(parsed.pathname || '/contact', MAX_SOURCE_PAGE)
  }
  catch {
    if (raw.startsWith('/')) {
      return clamp(raw, MAX_SOURCE_PAGE)
    }

    return '/contact'
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ContactBody>(event)
  const referer = getRequestHeader(event, 'referer') || ''

  const fullName = clamp(trimToString(body?.fullName), MAX_FULL_NAME)
  const businessEmail = clamp(trimToString(body?.businessEmail).toLowerCase(), MAX_EMAIL)
  const rawPhoneNumber = trimToString(body?.phoneNumber)
  const phoneNumber = clamp(rawPhoneNumber, MAX_PHONE)
  const companyWebsite = clamp(trimToString(body?.companyWebsite), MAX_WEBSITE)
  const serviceInterest = clamp(trimToString(body?.serviceInterest), MAX_SERVICE_INTEREST)
  const message = clamp(trimToString(body?.message), MAX_MESSAGE)
  const website = trimToString(body?.website)
  const sourcePage = getSourcePage(body?.sourcePage, referer)

  const errors: Record<string, string> = {}

  if (!fullName) {
    errors.fullName = 'Full name is required.'
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)
  if (!businessEmail || !isValidEmail) {
    errors.businessEmail = 'Enter a valid business email address.'
  }

  if (!message) {
    errors.message = 'Please add a short message.'
  }

  if (message.length > MAX_MESSAGE) {
    errors.message = 'Message must be 2000 characters or less.'
  }

  if (rawPhoneNumber) {
    const isValidLength = rawPhoneNumber.length >= 7 && rawPhoneNumber.length <= MAX_PHONE
    const hasValidCharacters = PHONE_PATTERN.test(rawPhoneNumber)
    if (!isValidLength || !hasValidCharacters) {
      errors.phoneNumber = 'Please enter a valid phone number.'
    }
  }

  if (Object.keys(errors).length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: {
        message: 'Please check the highlighted fields and try again.',
        fieldErrors: errors
      }
    })
  }

  if (website) {
    return {
      ok: true,
      message: 'Thanks, your message has been captured for follow-up.'
    }
  }

  const config = useRuntimeConfig(event)
  const strapiUrl = (config.public.strapiUrl || '').replace(/\/+$/, '')
  const strapiApiToken = config.strapiApiToken

  if (!strapiUrl || !strapiApiToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configuration error',
      data: {
        message: 'Unable to submit your request right now. Please try again later.'
      }
    })
  }

  try {
    await $fetch(`${strapiUrl}/api/contact-submissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${strapiApiToken}`
      },
      body: {
        data: {
          fullName,
          businessEmail,
          phoneNumber,
          companyWebsite,
          serviceInterest,
          message,
          sourcePage,
          submitStatus: 'new',
          submittedAt: new Date().toISOString()
        }
      }
    })

    return {
      ok: true,
      message: 'Thanks, your message has been captured for follow-up.'
    }
  }
  catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Submission failed',
      data: {
        message: 'Unable to submit your request right now. Please try again later.'
      }
    })
  }
})
