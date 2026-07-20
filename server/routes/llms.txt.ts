import { defineEventHandler, setResponseHeader, setResponseStatus } from 'h3'
import { generateLlmsPayload, getCachedLlmsTxt, setCachedLlmsTxt } from '../utils/llms'

export default defineEventHandler(async (event) => {
  let text = await getCachedLlmsTxt()

  if (!text) {
    const payload = await generateLlmsPayload()
    text = payload.text
    await setCachedLlmsTxt(text, payload.success)
  }

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseStatus(event, 200)
  return text
})
