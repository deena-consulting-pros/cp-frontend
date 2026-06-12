<script setup lang="ts">
import type { ContactPageData } from '~/types/contact'

type ContactFormPayload = {
  fullName: string
  businessEmail: string
  phoneNumber: string
  companyWebsite: string
  serviceInterest: string
  message: string
  website: string
  sourcePage: string
}

type ContactApiErrorData = {
  message?: string
  fieldErrors?: Partial<Record<'fullName' | 'businessEmail' | 'phoneNumber' | 'message', string>>
}

type ContactApiSuccessData = {
  ok: boolean
  message?: string
}

type ToastState = {
  type: 'success' | 'error'
  message: string
  visible: boolean
}

const props = withDefaults(defineProps<{
  heading?: ContactPageData['contactFormSection']
  helperText?: string
  submitButtonLabel?: string
  serviceOptions?: ContactPageData['serviceOptions']
  contactInfoCards?: ContactPageData['contactInfoCards']
}>(), {
  heading: () => ({ label: '', title: 'Send us a message', highlightText: '', subtitle: '', alignment: 'left' }),
  helperText: 'We usually reply within one business day.',
  submitButtonLabel: 'Send Message',
  serviceOptions: () => [],
  contactInfoCards: () => []
})

const formState = reactive({
  fullName: '',
  email: '',
  phone: '',
  company: '',
  serviceInterest: '',
  message: '',
  website: ''
})

const formErrors = reactive({
  fullName: '',
  email: '',
  phone: '',
  message: ''
})

const submitState = ref<'idle' | 'submitting' | 'success' | 'error'>('idle')
const toastState = reactive<ToastState>({
  type: 'success',
  message: '',
  visible: false
})
let toastTimeoutId: ReturnType<typeof setTimeout> | null = null

const visibleServiceOptions = computed(() => props.serviceOptions.filter((option) => option.label))

const hideToast = () => {
  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId)
    toastTimeoutId = null
  }
  toastState.visible = false
}

const showToast = (type: ToastState['type'], message: string) => {
  hideToast()
  toastState.type = type
  toastState.message = message
  toastState.visible = true
  toastTimeoutId = setTimeout(() => {
    toastState.visible = false
    toastTimeoutId = null
  }, 4000)
}

const resetFieldErrors = () => {
  formErrors.fullName = ''
  formErrors.email = ''
  formErrors.phone = ''
  formErrors.message = ''
}

const PHONE_PATTERN = /^[0-9+\-()\s]+$/

const validateForm = () => {
  resetFieldErrors()

  formErrors.fullName = formState.fullName.trim() ? '' : 'Full name is required.'

  const email = formState.email.trim()
  formErrors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Enter a valid business email address.'

  const trimmedMessage = formState.message.trim()
  if (!trimmedMessage) {
    formErrors.message = 'Please add a short message.'
  }
  else if (trimmedMessage.length > 2000) {
    formErrors.message = 'Message must be 2000 characters or less.'
  }

  const trimmedPhone = formState.phone.trim()
  if (trimmedPhone) {
    const isValidLength = trimmedPhone.length >= 7 && trimmedPhone.length <= 25
    const hasValidCharacters = PHONE_PATTERN.test(trimmedPhone)

    if (!isValidLength || !hasValidCharacters) {
      formErrors.phone = 'Please enter a valid phone number.'
    }
  }

  return !formErrors.fullName && !formErrors.email && !formErrors.phone && !formErrors.message
}

const resetForm = () => {
  formState.fullName = ''
  formState.email = ''
  formState.phone = ''
  formState.company = ''
  formState.serviceInterest = ''
  formState.message = ''
  formState.website = ''
}

const buildPayload = (): ContactFormPayload => {
  return {
    fullName: formState.fullName.trim(),
    businessEmail: formState.email.trim(),
    phoneNumber: formState.phone.trim(),
    companyWebsite: formState.company.trim(),
    serviceInterest: formState.serviceInterest.trim(),
    message: formState.message.trim(),
    website: formState.website.trim(),
    sourcePage: '/contact'
  }
}

const handleSubmit = async () => {
  submitState.value = 'idle'

  if (!validateForm()) {
    return
  }

  submitState.value = 'submitting'

  try {
    const minimumDelay = new Promise((resolve) => setTimeout(resolve, 600))
    const submitRequest = $fetch<ContactApiSuccessData>('/api/contact', {
      method: 'POST',
      body: buildPayload()
    })
    const [response] = await Promise.all([submitRequest, minimumDelay])

    submitState.value = 'success'
    resetFieldErrors()
    resetForm()
    showToast('success', response?.message || 'Thanks, your message has been captured for follow-up.')
  }
  catch (error: unknown) {
    const fetchError = error as { data?: ContactApiErrorData }
    const fieldErrors = fetchError?.data?.fieldErrors

    if (fieldErrors?.fullName) {
      formErrors.fullName = fieldErrors.fullName
    }

    if (fieldErrors?.businessEmail) {
      formErrors.email = fieldErrors.businessEmail
    }

    if (fieldErrors?.message) {
      formErrors.message = fieldErrors.message
    }

    if (fieldErrors?.phoneNumber) {
      formErrors.phone = fieldErrors.phoneNumber
    }

    submitState.value = 'error'
    showToast('error', 'Unable to send your message right now. Please try again.')
  }
}

onBeforeUnmount(() => {
  hideToast()
})
</script>

<template>
  <section class="grid items-end gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10">
    <div>
      <SectionHeading
        :heading="heading"
        alignment="left"
        :center-container="false"
        margin-bottom-class="mb-5"
        max-width="max-w-[45rem]"
      />

      <p v-if="heading?.subtitle" class="mb-5 max-w-[44rem] text-[1.05rem] leading-8 text-slate-600">{{ heading.subtitle }}</p>

      <form class="form-shell rounded-[1.8rem] p-8 sm:p-9 lg:p-10" novalidate @submit.prevent="handleSubmit">
        <div class="hidden" aria-hidden="true">
          <label for="website">Website</label>
          <input id="website" v-model="formState.website" type="text" tabindex="-1" autocomplete="off">
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label for="fullName" class="contact-label">Full Name</label>
            <input id="fullName" v-model="formState.fullName" class="contact-input" type="text" autocomplete="name" required :aria-invalid="Boolean(formErrors.fullName)" :aria-describedby="formErrors.fullName ? 'full-name-error' : undefined">
            <p v-if="formErrors.fullName" id="full-name-error" class="contact-error">{{ formErrors.fullName }}</p>
          </div>

          <div>
            <label for="email" class="contact-label">Business Email</label>
            <input id="email" v-model="formState.email" class="contact-input" type="email" autocomplete="email" required :aria-invalid="Boolean(formErrors.email)" :aria-describedby="formErrors.email ? 'email-error' : undefined">
            <p v-if="formErrors.email" id="email-error" class="contact-error">{{ formErrors.email }}</p>
          </div>

          <div>
            <label for="phone" class="contact-label">Phone Number (Optional)</label>
            <input id="phone" v-model="formState.phone" class="contact-input" type="tel" autocomplete="tel" placeholder="+971 50 000 0000" :aria-invalid="Boolean(formErrors.phone)" :aria-describedby="formErrors.phone ? 'phone-error' : undefined">
            <p v-if="formErrors.phone" id="phone-error" class="contact-error">{{ formErrors.phone }}</p>
          </div>

          <div>
            <label for="company" class="contact-label">Company / Website</label>
            <input id="company" v-model="formState.company" class="contact-input" type="text" autocomplete="organization">
          </div>

          <div class="sm:col-span-2">
            <label for="serviceInterest" class="contact-label">Service Interest</label>
            <select id="serviceInterest" v-model="formState.serviceInterest" class="contact-input">
              <option value="">Select a service</option>
              <option v-for="option in visibleServiceOptions" :key="option.id" :value="option.value">{{ option.label }}</option>
            </select>
          </div>

          <div class="sm:col-span-2">
            <label for="message" class="contact-label">Message</label>
            <textarea id="message" v-model="formState.message" class="contact-input min-h-36 resize-y" required :aria-invalid="Boolean(formErrors.message)" :aria-describedby="formErrors.message ? 'message-error' : undefined"></textarea>
            <p v-if="formErrors.message" id="message-error" class="contact-error">{{ formErrors.message }}</p>
          </div>
        </div>

        <div class="mt-6">
          <button type="submit" class="submit-button inline-flex w-full items-center justify-center rounded-full px-8 py-4 text-base font-semibold text-white" :disabled="submitState === 'submitting'" :aria-busy="submitState === 'submitting'">
            {{ submitState === 'submitting' ? 'Sending...' : (submitButtonLabel || 'Send Message') }}
          </button>
          <p v-if="helperText" class="mt-3 text-center text-sm text-slate-500">{{ helperText }}</p>
        </div>
      </form>
    </div>

    <ContactInfoCards :cards="contactInfoCards" />

  </section>

  <Teleport to="body">
    <div
      v-if="toastState.visible"
      class="contact-toast fixed right-4 top-4 z-[1000] w-[calc(100vw-2rem)] max-w-sm rounded-2xl p-4 shadow-lg sm:right-6 sm:top-6"
      :class="toastState.type === 'success' ? 'contact-toast-success' : 'contact-toast-error'"
      :role="toastState.type === 'success' ? 'status' : 'alert'"
      :aria-live="toastState.type === 'success' ? 'polite' : undefined"
    >
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm font-medium leading-6">{{ toastState.message }}</p>
        <button
          type="button"
          class="toast-close inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          aria-label="Dismiss notification"
          @click="hideToast"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.form-shell {
  border: 1px solid #dfe4e8;
  background: #ffffff;
  box-shadow: 0 16px 34px rgba(0, 28, 42, 0.1);
}

.contact-label {
  display: inline-block;
  margin-bottom: 0.5rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #123447;
}

.contact-input {
  width: 100%;
  min-height: 3rem;
  border-radius: 0.75rem;
  border: 1px solid #cfd7dd;
  background: #f9f9fb;
  padding: 0.82rem 0.95rem;
  font-size: 0.96rem;
  color: #001c2a;
}

.contact-input:focus-visible {
  outline: none;
  border-color: #006c4f;
  box-shadow: 0 0 0 3px rgba(103, 252, 198, 0.25);
}

.submit-button {
  background: #001c2a;
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.75;
}

.submit-button:focus-visible {
  outline: 2px solid #67fcc6;
  outline-offset: 3px;
}

.contact-error {
  margin-top: 0.3rem;
  font-size: 0.74rem;
  font-weight: 600;
  color: #b42318;
}

.contact-toast {
  border: 1px solid transparent;
  background: #ffffff;
  color: #001c2a;
  overflow-wrap: anywhere;
}

.contact-toast-success {
  border-color: #67fcc6;
  box-shadow: 0 14px 34px rgba(0, 108, 79, 0.2);
}

.contact-toast-error {
  border-color: #f6b7b2;
  box-shadow: 0 14px 34px rgba(180, 35, 24, 0.18);
}

.toast-close {
  border: 1px solid rgba(0, 28, 42, 0.12);
  color: #123447;
  background: rgba(255, 255, 255, 0.88);
}

.toast-close:focus-visible {
  outline: 2px solid #67fcc6;
  outline-offset: 2px;
}
</style>
