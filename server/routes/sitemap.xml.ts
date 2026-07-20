import { defineEventHandler, setResponseHeader, setResponseStatus } from 'h3'
import { generateSitemapPayload, getCachedSitemapXml, setCachedSitemapXml } from '../utils/sitemap'

export default defineEventHandler(async (event) => {
  let xml = await getCachedSitemapXml()

  if (!xml) {
    const payload = await generateSitemapPayload()
    xml = payload.xml
    await setCachedSitemapXml(xml, payload.success)
  }

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseStatus(event, 200)
  return xml
})
