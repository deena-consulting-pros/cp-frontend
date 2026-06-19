<script setup lang="ts">
import {
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildWebPageSchema,
  normalizeAbsoluteUrl,
  sanitizeSchemaUrl,
} from "~/utils/schema";
import { resolveIconKey } from "~/utils/iconMap";

interface StrapiRecord {
  id?: number | string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const route = useRoute();
const slug = computed(() =>
  String(route.params.slug || "")
    .trim()
    .toLowerCase(),
);

const defaults = useSeoDefaults();
const { buildApiUrl, resolveImageUrl } = useStrapi();

const unwrap = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object") return {};
  const source = value as StrapiRecord;
  const nestedData = (source as { data?: unknown }).data;
  const nested = Array.isArray(nestedData) ? nestedData[0] : nestedData;
  const record = (
    nested && typeof nested === "object" ?
      nested
    : source) as StrapiRecord;
  return { ...(record.attributes || {}), ...record };
};

const text = (...values: Array<unknown>) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
};

const asArray = (value: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => unwrap(item))
    .filter((item) => Object.keys(item).length);
};

const normalizeLink = (value: unknown, fallback = "/services") => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const parseNumericPercent = (value: string): number | null => {
  const num = Number(value.replace(/%/g, "").trim());
  return Number.isFinite(num) && num > 0 ? Math.min(num, 100) : null;
};

const detailEndpoint = computed(() =>
  buildApiUrl(
    `/api/services?filters[slug][$eq]=${encodeURIComponent(slug.value)}&populate[serviceDetails][populate][detailCard][populate]=*&populate[serviceDetails][populate][textPill][populate]=*&populate[serviceDetails][populate][visualItem][populate]=*&populate[serviceDetails][populate][checkListItem][populate]=*&populate[serviceDetails][populate][processSteps][populate]=*&populate[serviceDetails][populate][faqHeading][populate]=*&populate[serviceDetails][populate][faqSection][populate]=*&populate[serviceCta][populate][button]=*&populate[serviceCta][populate][backgroundImage][fields][0]=url&populate[serviceCta][populate][backgroundImage][fields][1]=alternativeText&populate[seo][populate][metaImage][fields][0]=url&populate[seo][populate][metaImage][fields][1]=alternativeText&populate[featuredImage][fields][0]=url&populate[featuredImage][fields][1]=alternativeText`,
  ),
);

const relatedEndpoint = computed(() =>
  buildApiUrl(
    "/api/services?fields[0]=title&fields[1]=slug&fields[2]=shortDescription&fields[3]=description&populate[featuredImage][fields][0]=url&populate[featuredImage][fields][1]=alternativeText&sort[0]=order:asc",
  ),
);

const asyncDataKey = computed(() => `service-detail-page-${slug.value}`);

const {
  data: serviceResponse,
  pending,
  error,
} = await useAsyncData(
  asyncDataKey,
  async () => {
    const [detail, related] = await Promise.all([
      $fetch<{ data?: unknown[] }>(detailEndpoint.value),
      $fetch<{ data?: unknown[] }>(relatedEndpoint.value),
    ]);

    return {
      detail: Array.isArray(detail.data) ? detail.data : [],
      related: Array.isArray(related.data) ? related.data : [],
    };
  },
  {
    server: true,
    default: () => ({ detail: [], related: [] }),
  },
);

if (error.value) {
  throw createError({
    statusCode: 500,
    statusMessage: "Unable to load this service right now.",
  });
}

const serviceEntry = computed(() => unwrap(serviceResponse.value.detail[0]));

if (!serviceEntry.value.slug) {
  throw createError({ statusCode: 404, statusMessage: "Service not found." });
}

const serviceDetails = computed(() =>
  unwrap(serviceEntry.value.serviceDetails),
);

const heroPills = computed(() =>
  asArray(serviceDetails.value.textPill)
    .map((item, index) => ({
      id: String(item.id ?? `pill-${index}`),
      text: text(item.text, item.title, item.label, item.value),
    }))
    .filter((item) => item.text),
);

const heroVisualRows = computed(() =>
  asArray(serviceDetails.value.visualItem)
    .map((item, index) => ({
      id: String(item.id ?? `visual-${index}`),
      label: text(item.title, item.label, item.text),
      value: text(item.value, item.description),
    }))
    .filter((item) => item.label),
);

const checklist = computed(() =>
  asArray(serviceDetails.value.checkListItem)
    .map((item, index) => ({
      id: String(item.id ?? `check-${index}`),
      text: text(item.text, item.title, item.label, item.value),
    }))
    .filter((item) => item.text),
);

const detailCards = computed(() =>
  asArray(serviceDetails.value.detailCard)
    .map((item, index) => {
      const orderValue = item.order;
      const order =
        typeof orderValue === "number" ? orderValue : (
          Number(String(orderValue || "").trim())
        );

      return {
        id: String(item.id ?? `card-${index}`),
        title: text(item.title, item.heading),
        description: text(item.description, item.text, item.subtitle),
        iconKey:
          resolveIconKey(item.iconKey) ||
          resolveIconKey(item.icon) ||
          resolveIconKey(item.iconName),
        order: Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER,
      };
    })
    .filter((item) => item.title || item.description)
    .sort((a, b) => a.order - b.order),
);

const includedCards = computed(() =>
  detailCards.value.filter((card) => card.order < 100),
);
const benefitCards = computed(() =>
  detailCards.value.filter((card) => card.order >= 100),
);

const processSteps = computed(() =>
  asArray(serviceDetails.value.processSteps)
    .map((item, index) => ({
      id: String(item.id ?? `step-${index}`),
      title: text(item.title, item.heading),
      description: text(item.description, item.text),
      stepLabel:
        text(item.stepLabel, item.stepNumber) ||
        String(index + 1).padStart(2, "0"),
    }))
    .filter((item) => item.title || item.description),
);

const faqHeading = computed(() => {
  const heading = unwrap(serviceDetails.value.faqHeading);
  return text(
    heading.title,
    heading.heading,
    heading.label,
    "Frequently asked questions",
  );
});

const faqItems = computed(() =>
  asArray(serviceDetails.value.faqSection)
    .map((item, index) => ({
      id: String(item.id ?? `faq-${index}`),
      question: text(item.question, item.title, item.heading),
      answer: text(item.answer, item.description, item.text),
    }))
    .filter((item) => item.question && item.answer),
);

const serviceCta = computed(() => unwrap(serviceEntry.value.serviceCta));

const serviceCtaButton = computed(() => unwrap(serviceCta.value.button));

const serviceCtaBackgroundImage = computed(() =>
  unwrap(serviceCta.value.backgroundImage),
);

const serviceCtaBackgroundImageUrl = computed(() =>
  resolveImageUrl(serviceCtaBackgroundImage.value),
);

const relatedServices = computed(() =>
  (serviceResponse.value.related || [])
    .map((entry) => unwrap(entry))
    .filter((entry) => text(entry.slug) && text(entry.slug) !== slug.value)
    .slice(0, 3)
    .map((entry, index) => ({
      id: String(entry.id ?? `related-${index}`),
      title: text(entry.title, "Service"),
      description: text(
        entry.shortDescription,
        entry.description,
        "Explore how this service supports your growth goals.",
      ),
      href: normalizeLink(`/services/${text(entry.slug)}`),
      image: resolveImageUrl(unwrap(entry.featuredImage)),
    })),
);

const fallbackIncluded = [
  {
    id: "inc-fallback-1",
    title: "Technical SEO Review",
    description:
      "Audit indexing, crawlability, and on-site structure to remove ranking blockers.",
    iconKey: "checkCircle",
  },
  {
    id: "inc-fallback-2",
    title: "Search Intent Mapping",
    description:
      "Map commercial intent keywords to the right pages and content journeys.",
    iconKey: "search",
  },
  {
    id: "inc-fallback-3",
    title: "On-Page Optimization",
    description:
      "Refine metadata, headers, internal links, and content hierarchy for clarity.",
    iconKey: "settings",
  },
];

const fallbackBenefits = [
  {
    id: "benefit-fallback-1",
    title: "Clearer Search Priorities",
    description:
      "Focus on actions tied to business goals instead of vanity metrics.",
    iconKey: "target",
  },
  {
    id: "benefit-fallback-2",
    title: "Stronger Website Foundation",
    description:
      "Address technical gaps that prevent sustained organic visibility.",
    iconKey: "shield",
  },
];

const displayIncludedCards = computed(() =>
  includedCards.value.length ? includedCards.value : fallbackIncluded,
);
const displayBenefitCards = computed(() =>
  benefitCards.value.length ? benefitCards.value : fallbackBenefits,
);

const pageTitle = computed(() =>
  text(
    unwrap(serviceEntry.value.seo).metaTitle,
    serviceEntry.value.title,
    `${slug.value.toUpperCase()} Service`,
  ),
);

const pageDescription = computed(() =>
  text(
    unwrap(serviceEntry.value.seo).metaDescription,
    serviceEntry.value.shortDescription,
    "Strategic service delivery designed around measurable business outcomes.",
  ),
);

const canonicalPath = computed(() => `/services/${slug.value}`);
const featuredImage = computed(() => unwrap(serviceEntry.value.featuredImage));
const featuredImageUrl = computed(() => resolveImageUrl(featuredImage.value));

const { canonicalUrl } = usePageMeta({
  pageType: "page",
  title: pageTitle.value,
  description: pageDescription.value,
  canonicalPath: canonicalPath.value,
  image: {
    url: featuredImageUrl.value,
    alt: text(featuredImage.value.alternativeText, serviceEntry.value.title),
  },
  noindex: unwrap(serviceEntry.value.seo).noindex as boolean | undefined,
  nofollow: unwrap(serviceEntry.value.seo).nofollow as boolean | undefined,
});

const siteUrl = normalizeAbsoluteUrl(defaults.siteUrl) || "";
const siteName = defaults.siteName || "Consulting Pros";
const serviceUrl = `${siteUrl}${canonicalPath.value}`;
const breadcrumbId = `${serviceUrl}#breadcrumb`;

const logoUrl = sanitizeSchemaUrl(
  resolveImageUrl(defaults.siteLogo, siteUrl),
  siteUrl,
);
const organizationSchema = buildOrganizationSchema({
  siteUrl,
  name: siteName,
  logo: logoUrl || undefined,
  description: defaults.siteDescription || undefined,
});

const webPageSchema = buildWebPageSchema({
  canonicalUrl,
  siteUrl,
  id: `${serviceUrl}#webpage`,
  name: pageTitle.value,
  description: pageDescription.value,
  primaryImageOfPage:
    sanitizeSchemaUrl(resolveImageUrl(featuredImage.value, siteUrl), siteUrl) ||
    undefined,
  inLanguage: defaults.siteLanguage || "en",
  breadcrumbId,
});

const breadcrumbSchema = buildBreadcrumbSchema({
  id: breadcrumbId,
  items: [
    { name: "Home", url: siteUrl },
    { name: "Services", url: `${siteUrl}/services` },
    { name: text(serviceEntry.value.title, "Service"), url: serviceUrl },
  ],
});

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${serviceUrl}#service`,
  name: text(serviceEntry.value.title),
  description: pageDescription.value,
  provider: {
    "@id": `${siteUrl}/#organization`,
  },
  url: serviceUrl,
};

useJsonLd(
  computed(() => [
    organizationSchema,
    webPageSchema,
    breadcrumbSchema,
    serviceSchema,
  ]),
);

const mainRef = ref<HTMLElement | null>(null);
const visibleSectionIds = ref<Set<string>>(new Set());
let sectionObserver: IntersectionObserver | null = null;

const markSectionVisible = (id: string) => {
  const next = new Set(visibleSectionIds.value);
  next.add(id);
  visibleSectionIds.value = next;
};

const isSectionVisible = (id: string) => visibleSectionIds.value.has(id);

const observeRevealSections = async () => {
  if (!import.meta.client) return;
  await nextTick();

  const nodes =
    mainRef.value?.querySelectorAll<HTMLElement>("[data-reveal-id]") || [];
  if (!nodes.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    nodes.forEach((node) => {
      const id = node.dataset.revealId;
      if (id) markSectionVisible(id);
    });
    return;
  }

  sectionObserver?.disconnect();
  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = (entry.target as HTMLElement).dataset.revealId;
        if (!id) return;
        markSectionVisible(id);
        sectionObserver?.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
  );

  nodes.forEach((node) => sectionObserver?.observe(node));
};

onMounted(() => {
  observeRevealSections();
});

watch(
  () => pending.value,
  (isPending) => {
    if (!isPending) {
      observeRevealSections();
    }
  },
);

onBeforeUnmount(() => {
  sectionObserver?.disconnect();
});
</script>

<template>
  <main
    ref="mainRef"
    class="min-h-screen overflow-x-clip bg-[#f9f9fb] text-[#001c2a]"
  >
    <div
      v-if="pending"
      class="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8"
    >
      <p role="status" aria-live="polite" class="text-sm text-slate-600">
        Loading service details...
      </p>
    </div>

    <template v-else>
      <section
        data-reveal-id="hero"
        class="service-detail-reveal relative w-full py-14 lg:py-24"
        :class="{ 'is-visible': isSectionVisible('hero') }"
      >
        <div
          class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(103,252,198,0.05),transparent_40%),radial-gradient(circle_at_90%_80%,rgba(0,28,42,0.03),transparent_40%)]"
        ></div>

        <div
          class="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8"
        >
          <div class="flex min-w-0 flex-col justify-center">
            <p class="eyebrow text-[#006c4f]">
              {{ text(serviceEntry.serviceCategory, "Service") }}
            </p>
            <h1 class="mt-5">
              {{ text(serviceEntry.title, "Service") }}
            </h1>
            <p class="mt-5 max-w-[60ch] text-[#41484c]">
              {{ text(serviceEntry.shortDescription, pageDescription) }}
            </p>

            <div class="mt-8 flex flex-wrap gap-3">
              <span
                v-for="pill in heroPills"
                :key="pill.id"
                class="rounded-full bg-[#006c4f]/10 px-4 py-1.5 text-sm font-semibold text-[#006c4f]"
              >
                {{ pill.text }}
              </span>
            </div>

            <div class="mt-10 flex flex-wrap gap-4">
              <NuxtLink to="/contact" class="service-btn service-btn--primary"
                >Get Free Consultation</NuxtLink
              >
              <a href="#service-process" class="service-btn service-btn--ghost"
                >View Process</a
              >
            </div>
          </div>

          <div class="relative min-w-0">
            <div
              class="relative overflow-hidden rounded-[2rem] bg-[#003247] p-8 shadow-[0_24px_60px_rgba(0,28,42,0.24)] sm:p-10 lg:p-12"
            >
              <div
                class="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-[#67fcc6]/10 blur-3xl"
              ></div>
              <div class="relative space-y-8">
                <div
                  v-for="row in heroVisualRows"
                  :key="row.id"
                  class="space-y-4"
                >
                  <div
                    class="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(120px,170px)_1fr] sm:gap-6"
                  >
                    <span
                      class="text-sm font-semibold leading-6 tracking-wide text-white/90"
                    >
                      {{ row.label }}
                    </span>

                    <span
                      class="text-xs font-bold uppercase leading-6 tracking-wide text-[#67fcc6]"
                    >
                      {{ row.value || "Included" }}
                    </span>
                  </div>

                  <div
                    v-if="parseNumericPercent(row.value) !== null"
                    class="h-2 w-full overflow-hidden rounded-full bg-white/10"
                  >
                    <div
                      class="h-full rounded-full bg-[#67fcc6] transition-all duration-1000"
                      :style="{ width: `${parseNumericPercent(row.value)}%` }"
                    ></div>
                  </div>

                  <div v-else class="h-px w-full bg-white/10"></div>
                </div>
              </div>
            </div>
            <div
              class="relative mt-4 max-w-full rounded-2xl border border-white/30 bg-white/80 p-4 shadow-[0_20px_40px_rgba(0,28,42,0.22)] backdrop-blur-md sm:p-5 lg:absolute lg:-bottom-6 lg:-left-4"
            >
              <p
                class="text-xs font-bold uppercase tracking-wider text-[#006c4f]"
              >
                Featured
              </p>
              <p class="mt-1 text-sm font-semibold text-[#001c2a]">
                {{ text(serviceEntry.title, "Service") }} Audit
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        data-reveal-id="overview"
        class="service-detail-reveal bg-white py-16 lg:py-24"
        :class="{ 'is-visible': isSectionVisible('overview') }"
      >
        <div
          class="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8"
        >
          <div>
            <p class="eyebrow">
              {{ text(serviceDetails?.overviewEyebrow, "Service Overview") }}
            </p>

            <h2 class="mt-4 section-title">
              {{
                text(
                  serviceDetails?.overviewTitle,
                  "Practical Support Built Around Your Goals",
                )
              }}
            </h2>

            <p class="mt-5 text-[#41484c]">
              {{
                text(
                  serviceDetails?.overviewDescription,
                  serviceEntry.description,
                  serviceEntry.shortDescription,
                  pageDescription,
                )
              }}
            </p>
          </div>

          <div
            class="rounded-[1.75rem] border border-[#d7e3eb] bg-[#f9f9fb] p-8"
          >
            <h3 class="text-[1.3rem] font-bold text-[#001c2a]">
              {{
                text(
                  serviceDetails?.overviewChecklistTitle,
                  "What this service helps with",
                )
              }}
            </h3>

            <ul class="mt-6 space-y-4">
              <li
                v-for="item in checklist"
                :key="item.id"
                class="flex items-start gap-3"
              >
                <span
                  class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d8f8ea] text-[#006c4f]"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="h-3.5 w-3.5"
                  >
                    <path d="m4 10 4 4 8-8" />
                  </svg>
                </span>

                <span class="text-[0.98rem] leading-7 text-[#41484c]">
                  {{ item.text }}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section
        data-reveal-id="included"
        class="service-detail-reveal py-16 lg:py-24"
        :class="{ 'is-visible': isSectionVisible('included') }"
      >
        <div class="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <p
              v-if="text(serviceDetails?.includedEyebrow)"
              class="eyebrow text-[#006c4f]"
            >
              {{ text(serviceDetails?.includedEyebrow) }}
            </p>

            <h2 class="section-title">
              {{ text(serviceDetails?.includedTitle, "What's Included") }}
            </h2>

            <p
              v-if="text(serviceDetails?.includedDescription)"
              class="mx-auto mt-5 max-w-[720px] text-[#41484c]"
            >
              {{ text(serviceDetails?.includedDescription) }}
            </p>
          </div>
          <div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="card in displayIncludedCards"
              :key="card.id"
              class="service-detail-card group rounded-2xl border border-[#e2e2e4]/80 bg-white/75 p-8 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-2"
            >
              <span
                class="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#006c4f]/10 text-[#006c4f]"
              >
                <AppIcon
                  :icon-key="card.iconKey || 'checkCircle'"
                  :title="card.title"
                  class="h-6 w-6"
                />
              </span>
              <h3 class="text-xl font-bold text-[#001c2a]">
                {{ card.title }}
              </h3>
              <p class="mt-3 text-base leading-7 text-[#41484c]">
                {{ card.description }}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        id="service-process"
        data-reveal-id="process"
        class="service-detail-reveal bg-[#001c2a] py-16 text-white lg:py-24"
        :class="{ 'is-visible': isSectionVisible('process') }"
      >
        <div class="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <h2 class="section-title text-white text-center lg:text-left">
            Our Strategic Process
          </h2>
          <div class="relative mt-16">
            <!-- Desktop timeline line -->
            <div
              class="absolute left-0 right-0 top-6 hidden h-0.5 bg-white/10 lg:block"
            ></div>
            <!-- Mobile timeline line -->
            <div
              class="absolute left-6 top-0 h-full w-0.5 bg-white/10 lg:hidden"
            ></div>

            <div
              class="relative grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-6"
            >
              <article
                v-for="(step, index) in processSteps"
                :key="step.id"
                class="relative flex flex-row gap-5 lg:flex-col lg:items-center lg:text-center"
              >
                <div
                  class="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-[#006c4f] bg-[#001c2a] shadow-lg"
                >
                  <span class="text-sm font-bold text-white">
                    {{ step.stepLabel || String(index + 1).padStart(2, "0") }}
                  </span>
                </div>
                <div class="pt-1 lg:pt-6">
                  <h3 class="text-xl font-bold text-white">
                    {{ step.title }}
                  </h3>
                  <p class="mt-2 text-sm leading-7 text-white/75">
                    {{ step.description }}
                  </p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section
        data-reveal-id="benefits"
        class="service-detail-reveal bg-[#f3f3f5] py-16 lg:py-24"
        :class="{ 'is-visible': isSectionVisible('benefits') }"
      >
        <div class="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <p
              v-if="text(serviceDetails?.benefitsEyebrow)"
              class="eyebrow text-[#006c4f]"
            >
              {{ text(serviceDetails?.benefitsEyebrow) }}
            </p>

            <h2 class="section-title text-center">
              {{ text(serviceDetails?.benefitsTitle, "The Core Benefits") }}
            </h2>

            <p
              v-if="text(serviceDetails?.benefitsDescription)"
              class="mx-auto mt-5 max-w-[720px] text-[#41484c]"
            >
              {{ text(serviceDetails?.benefitsDescription) }}
            </p>
          </div>

          <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <article
              v-for="card in displayBenefitCards"
              :key="card.id"
              class="service-detail-card rounded-2xl border border-white bg-white p-8 shadow-sm"
            >
              <span
                class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-[#006c4f]/10 text-[#006c4f]"
              >
                <AppIcon
                  :icon-key="card.iconKey || 'spark'"
                  :title="card.title"
                  class="h-6 w-6"
                />
              </span>

              <h3 class="text-xl font-bold text-[#001c2a]">
                {{ card.title }}
              </h3>

              <p class="mt-3 text-base leading-7 text-[#41484c]">
                {{ card.description }}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        data-reveal-id="related"
        class="service-detail-reveal py-16 lg:py-24"
        :class="{ 'is-visible': isSectionVisible('related') }"
      >
        <div class="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <ServiceDetailRelatedServices :services="relatedServices" />
        </div>
      </section>

      <section
        data-reveal-id="faq"
        class="service-detail-reveal bg-white py-16 lg:py-24"
        :class="{ 'is-visible': isSectionVisible('faq') }"
      >
        <div class="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <ServiceDetailFaq :heading="faqHeading" :items="faqItems" />
        </div>
      </section>

      <section
        data-reveal-id="cta"
        class="service-detail-reveal pb-20 lg:pb-24"
        :class="{ 'is-visible': isSectionVisible('cta') }"
      >
        <div class="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div
            class="relative overflow-hidden rounded-[2rem] bg-[#003247] px-6 py-14 text-center sm:px-10 lg:px-16 lg:py-20"
          >
            <img
              v-if="serviceCtaBackgroundImageUrl"
              :src="serviceCtaBackgroundImageUrl"
              :alt="text(serviceCtaBackgroundImage.alternativeText, serviceCta.title)"
              class="absolute inset-0 h-full w-full object-cover opacity-20"
            />

            <div
              class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(103,252,198,0.1),transparent_70%)]"
            ></div>

            <div class="absolute inset-0 bg-[#003247]/80"></div>

            <div class="relative mx-auto max-w-[760px]">
              <h2 class="text-white">
                {{
                  text(
                    serviceCta.title,
                    "Ready to Move This Service Forward?",
                  )
                }}
              </h2>

              <p class="mt-5 text-lg text-[#a4cce6]">
                {{
                  text(
                    serviceCta.description,
                    "Book a focused consultation and get a practical next-step plan tailored to your goals.",
                  )
                }}
              </p>

              <a
                v-if="serviceCtaButton.newTab"
                :href="normalizeLink(text(serviceCtaButton.url), '/contact')"
                target="_blank"
                rel="noopener noreferrer"
                class="service-btn service-btn--mint mt-10 inline-flex"
              >
                {{ text(serviceCtaButton.label, "Get Free Consultation") }}
              </a>

              <NuxtLink
                v-else
                :to="normalizeLink(text(serviceCtaButton.url), '/contact')"
                class="service-btn service-btn--mint mt-10 inline-flex"
              >
                {{ text(serviceCtaButton.label, "Get Free Consultation") }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>
    </template>
  </main>
</template>

<style scoped>
.service-detail-reveal {
  opacity: 0;
  transform: translateY(20px);
}

.service-detail-reveal.is-visible {
  animation: serviceDetailFadeUp 0.72s ease-out both;
}

.service-detail-card {
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    border-color 0.24s ease;
}

.service-detail-card:hover {
  border-color: #c8d5df;
  box-shadow: 0 20px 40px rgba(0, 28, 42, 0.12);
}

.service-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0.75rem 1.75rem;
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.service-btn:hover {
  transform: translateY(-2px);
}

.service-btn:active {
  transform: translateY(0);
}

.service-btn--primary {
  background: #006c4f;
  color: #fff;
  box-shadow: 0 14px 28px rgba(0, 108, 79, 0.25);
}

.service-btn--primary:hover {
  box-shadow: 0 18px 34px rgba(0, 108, 79, 0.3);
}

.service-btn--ghost {
  border: 1px solid #001c2a;
  color: #001c2a;
  background: transparent;
}

.service-btn--ghost:hover {
  background: rgba(0, 28, 42, 0.06);
}

.service-btn--mint {
  background: #67fcc6;
  color: #002115;
  box-shadow: 0 16px 30px rgba(103, 252, 198, 0.22);
}

.service-btn--mint:hover {
  box-shadow: 0 20px 38px rgba(103, 252, 198, 0.28);
}

@keyframes serviceDetailFadeUp {
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
  .service-detail-reveal,
  .service-detail-reveal.is-visible {
    opacity: 1;
    transform: none;
    animation: none !important;
  }

  .service-btn,
  .service-btn:hover,
  .service-btn:active {
    transition: none;
    transform: none;
  }

  .service-detail-card,
  .service-detail-card:hover {
    transition: none;
    transform: none;
  }
}
</style>
