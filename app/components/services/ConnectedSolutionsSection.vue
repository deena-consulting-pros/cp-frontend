<script setup lang="ts">
import type { ServicesPageData } from '~/types/services'
import { resolveIconKey } from '~/utils/iconMap'

type ConnectedSolutions = NonNullable<ServicesPageData['connectedSolutions']>
type ConnectedPoint = ConnectedSolutions['points'][number]
type OrbitItemSource = ConnectedSolutions['orbitItems'][number] & {
  title?: string
  text?: string
  features?: string
}

const props = withDefaults(defineProps<{
  section?: ConnectedSolutions | null
}>(), {
  section: null
})

const sectionRef = ref<HTMLElement | null>(null)
const leftVisible = ref(false)
const orbitVisible = ref(false)
const visiblePointIds = ref<Set<string>>(new Set())
let leftObserver: IntersectionObserver | null = null
let pointObserver: IntersectionObserver | null = null
let orbitObserver: IntersectionObserver | null = null

const hasSection = computed(() => Boolean(props.section))
const sortedPoints = computed(() => {
  const points = props.section?.points || []
  return [...points].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
})
const hasPoints = computed(() => sortedPoints.value.length > 0)
const centerLabel = computed(() => props.section?.centerLabel?.trim() || '')

const getIconName = (point: ConnectedPoint) => {
  if (!point) return ''
  if (typeof point.iconKey === 'string') return resolveIconKey(point.iconKey)
  if (point.iconKey && typeof point.iconKey === 'object') {
    const nested = point.iconKey as { iconKey?: unknown }
    return resolveIconKey(nested.iconKey)
  }
  return ''
}

const pointsWithIcons = computed(() => (
  sortedPoints.value.map((point) => ({
    ...point,
    iconName: getIconName(point)
  }))
))

const getOrbitLabel = (item: OrbitItemSource) => (
  item?.label?.trim()
  || item?.title?.trim()
  || item?.text?.trim()
  || item?.features?.trim()
  || ''
)

const orbitLabels = computed(() => {
  const orbitItems = props.section?.orbitItems || []
  return orbitItems
    .map((item, index) => ({
      id: String(item.id ?? `orbit-item-${index}`),
      label: getOrbitLabel(item),
      order: item.order
    }))
    .filter((item) => item.label)
})

const sortedOrbitLabels = computed(() => (
  [...orbitLabels.value].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
))

type OrbitRing = {
  index: number
  id: string
  count: number
  radiusPercent: number
  nodeRadiusPercent: number
  stepDeg: number
  startAngleDeg: number
  durationSec: number
  direction: 'cw' | 'ccw'
  items: Array<{
    id: string
    label: string
    style: Record<string, string>
  }>
}

const ORBIT_BASE_CAPACITY = 4
const ORBIT_CAPACITY_STEP = 2
const ORBIT_BASE_RADIUS = 29
const ORBIT_RADIUS_STEP = 11
const ORBIT_BASE_DURATION = 44
const ORBIT_DURATION_STEP = 16
const ORBIT_NODE_RADIUS_BY_RING = [46, 47, 48]

const orbitRings = computed<OrbitRing[]>(() => {
  const source = sortedOrbitLabels.value
  const rings: OrbitRing[] = []
  const counts: number[] = []
  let cursor = 0
  let buildCursor = 0

  while (buildCursor < source.length) {
    const count = Math.min(ORBIT_BASE_CAPACITY + (counts.length * ORBIT_CAPACITY_STEP), source.length - buildCursor)
    counts.push(count)
    buildCursor += count
  }

  let ringIndex = 0
  let previousStepDeg = 0
  let previousStartAngleDeg = -90

  while (cursor < source.length) {
    const count = counts[ringIndex] || 0
    const ringItems = source.slice(cursor, cursor + count)
    const radiusPercent = ORBIT_BASE_RADIUS + (ringIndex * ORBIT_RADIUS_STEP)
    const stepDeg = count > 0 ? 360 / count : 0
    const startAngleDeg = ringIndex === 0
      ? -90
      : previousStartAngleDeg + (previousStepDeg / 2) + ((ringIndex % 2 === 0 ? 1 : -1) * Math.min(10, previousStepDeg * 0.2))
    const durationSec = ORBIT_BASE_DURATION + (ringIndex * ORBIT_DURATION_STEP)
    const direction = ringIndex % 2 === 0 ? 'cw' : 'ccw'
    const nodeRadiusPercent = ORBIT_NODE_RADIUS_BY_RING[ringIndex] ?? 48

    rings.push({
      index: ringIndex,
      id: `ring-${ringIndex}`,
      count,
      radiusPercent,
      nodeRadiusPercent,
      stepDeg,
      startAngleDeg,
      durationSec,
      direction,
      items: ringItems.map((item, itemIndex) => {
        const angleDeg = startAngleDeg + (stepDeg * itemIndex)
        const angleRad = (angleDeg * Math.PI) / 180
        const x = 50 + Math.cos(angleRad) * nodeRadiusPercent
        const y = 50 + Math.sin(angleRad) * nodeRadiusPercent
        return {
          id: item.id,
          label: item.label,
          style: {
            left: `${x}%`,
            top: `${y}%`
          }
        }
      })
    })

    previousStepDeg = stepDeg
    previousStartAngleDeg = startAngleDeg
    cursor += count
    ringIndex += 1
  }

  return rings
})

onMounted(() => {
  if (!import.meta.client || !sectionRef.value) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    leftVisible.value = true
    orbitVisible.value = true
    visiblePointIds.value = new Set(sortedPoints.value.map(point => point.id))
    return
  }

  leftObserver = new IntersectionObserver((entries) => {
    if (!entries[0]?.isIntersecting) return
    leftVisible.value = true
    leftObserver?.disconnect()
  }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' })

  orbitObserver = new IntersectionObserver((entries) => {
    if (!entries[0]?.isIntersecting) return
    orbitVisible.value = true
    orbitObserver?.disconnect()
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' })

  pointObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const id = (entry.target as HTMLElement).dataset.pointId
      if (!id) continue
      const next = new Set(visiblePointIds.value)
      next.add(id)
      visiblePointIds.value = next
      pointObserver?.unobserve(entry.target)
    }
  }, { threshold: 0.24, rootMargin: '0px 0px -10% 0px' })

  const leftBlock = sectionRef.value.querySelector<HTMLElement>('[data-connected-left]')
  const orbitBlock = sectionRef.value.querySelector<HTMLElement>('[data-connected-orbit]')
  if (leftBlock) leftObserver.observe(leftBlock)
  if (orbitBlock) orbitObserver.observe(orbitBlock)

  const pointItems = sectionRef.value.querySelectorAll<HTMLElement>('[data-point-id]')
  pointItems.forEach(item => pointObserver?.observe(item))
})

onBeforeUnmount(() => {
  leftObserver?.disconnect()
  pointObserver?.disconnect()
  orbitObserver?.disconnect()
})
</script>

<template>
  <section
    v-if="hasSection"
    ref="sectionRef"
    class="connected-solutions-section relative overflow-hidden bg-[#001c2a] py-16 md:py-20 lg:py-28"
    aria-labelledby="connected-solutions-title"
  >
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(103,252,198,0.16),transparent_42%),radial-gradient(circle_at_20%_75%,rgba(255,255,255,0.07),transparent_45%)]" aria-hidden="true" />

    <div class="relative mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-12 px-4 sm:px-6 md:gap-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
      <div data-connected-left class="connected-left" :class="{ 'is-visible': leftVisible }">
        <p
          v-if="section?.eyebrow"
          class="mb-5 text-sm font-bold tracking-[0.18em] text-[#67fcc6] uppercase"
        >
          {{ section.eyebrow }}
        </p>

        <h2
          v-if="section?.title"
          id="connected-solutions-title"
          class="font-display text-4xl leading-[1.06] font-extrabold tracking-[-0.028em] text-white sm:text-[2.7rem] lg:text-[3.35rem]"
        >
          {{ section.title }}
        </h2>

        <p
          v-if="section?.description"
          class="mt-6 max-w-[42.5rem] text-[1.06rem] leading-[1.72] text-slate-300 md:text-[1.12rem]"
        >
          {{ section.description }}
        </p>

        <div v-if="hasPoints" class="mt-10 space-y-8 md:space-y-9">
          <article
            v-for="(point, index) in pointsWithIcons"
            :key="point.id"
            :data-point-id="point.id"
            class="connected-point flex items-start gap-4"
            :class="{ 'is-visible': visiblePointIds.has(point.id) || leftVisible }"
            :style="{ '--delay': `${index * 90}ms` }"
          >
            <span
              class="mt-0.5 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)]"
            >
              <AppIcon
                v-if="point.iconName"
                :icon-key="point.iconName"
                class="connected-point-icon h-6 w-6 text-[#67fcc6]"
              />
            </span>

            <div class="min-w-0">
              <h3 v-if="point.title" class="text-[1.2rem] leading-tight font-semibold text-white">
                {{ point.title }}
              </h3>
              <p
                v-if="point.description"
                class="mt-2 text-[1.01rem] leading-7 text-slate-300"
              >
                {{ point.description }}
              </p>
            </div>
          </article>
        </div>
      </div>

      <div
        data-connected-orbit
        class="connected-orbit-wrap mx-auto w-full max-w-[620px]"
        :class="{ 'is-visible': orbitVisible }"
      >
        <div class="connected-orbit relative mx-auto h-[360px] w-[360px] sm:h-[460px] sm:w-[460px] lg:h-[560px] lg:w-[560px]">
          <div
            v-for="ring in orbitRings"
            :key="ring.id"
            class="orbit-track absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(255,255,255,0.14)]"
            :style="{
              left: '50%',
              top: '50%',
              width: `${ring.radiusPercent * 2}%`,
              height: `${ring.radiusPercent * 2}%`,
              '--orbit-duration': `${ring.durationSec}s`
            }"
          >
            <div class="orbit-rotator absolute inset-0" :class="ring.direction === 'ccw' ? 'is-ccw' : 'is-cw'" :style="{ '--orbit-duration': `${ring.durationSec}s` }">
              <template v-for="item in ring.items" :key="item.id">
                <span class="orbit-node" :style="item.style">
                  <span
                    class="orbit-pill inline-flex max-w-[140px] whitespace-nowrap px-2.5 py-1.5 text-[0.68rem] font-bold text-white sm:max-w-none sm:px-3.5 sm:py-2 sm:text-[0.8rem] lg:px-4 lg:text-[0.84rem]"
                    :class="ring.direction === 'ccw' ? 'counter-cw' : 'counter-ccw'"
                    :style="{ '--orbit-duration': `${ring.durationSec}s` }"
                  >
                    {{ item.label }}
                  </span>
                </span>
              </template>
            </div>
          </div>

          <div class="absolute left-1/2 top-1/2 z-[3] flex h-[110px] w-[110px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#67fcc6] px-4 text-center text-sm leading-tight font-extrabold text-[#001c2a] shadow-[0_18px_40px_rgba(103,252,198,0.28)] sm:h-[132px] sm:w-[132px] lg:h-[150px] lg:w-[150px] lg:text-[0.96rem]">
            <span v-if="centerLabel">{{ centerLabel }}</span>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.connected-left,
.connected-point,
.connected-orbit-wrap {
  opacity: 0;
  transform: translateY(20px);
}

.connected-point-icon {
  display: block;
  width: 24px;
  height: 24px;
  color: #67fcc6;
  opacity: 1;
  position: relative;
  z-index: 1;
}

.connected-left.is-visible {
  animation: connectedFadeUp 0.7s ease-out both;
}

.connected-point.is-visible {
  animation: connectedFadeUp 0.72s ease-out var(--delay, 0ms) both;
}

.connected-orbit-wrap.is-visible {
  animation: connectedFadeUp 0.76s ease-out 80ms both;
}

.orbit-pill {
  position: relative;
  display: inline-flex;
  z-index: 3;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 28, 42, 0.72);
  backdrop-filter: blur(4px);
}

.connected-orbit-wrap .orbit-node {
  position: absolute;
}

.orbit-track {
  transform-origin: center;
}

.orbit-rotator {
  will-change: transform;
}

.orbit-rotator.is-cw {
  animation: orbitSpinCw var(--orbit-duration, 44s) linear infinite;
}

.orbit-rotator.is-ccw {
  animation: orbitSpinCcw var(--orbit-duration, 44s) linear infinite;
}

.orbit-node {
  transform: translate(-50%, -50%);
  transform-origin: center;
}

.orbit-pill.counter-ccw {
  animation: orbitSpinCcw var(--orbit-duration, 44s) linear infinite;
}

.orbit-pill.counter-cw {
  animation: orbitSpinCw var(--orbit-duration, 44s) linear infinite;
}

@keyframes orbitSpinCw {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes orbitSpinCcw {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

@keyframes connectedFadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .connected-left,
  .connected-point,
  .connected-orbit-wrap,
  .orbit-rotator,
  .orbit-pill {
    opacity: 1;
    transform: none;
    animation: none !important;
    transition: none;
  }
}
</style>
