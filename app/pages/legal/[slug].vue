<script setup lang="ts">
import {
    buildBreadcrumbSchema,
    buildWebPageSchema,
} from "~/utils/schema";

interface StrapiRecord {
    id?: number | string;
    attributes?: Record<string, unknown>;
    [key: string]: unknown;
}

interface BlockNode {
    type?: string;
    text?: string;
    level?: number;
    format?: "ordered" | "unordered";
    url?: string;
    children?: BlockNode[];
}

const route = useRoute();
const slug = computed(() =>
    String(route.params.slug || "")
        .trim()
        .toLowerCase(),
);

const defaults = useSeoDefaults();
const { organizationSchema, siteUrl } = useOrganizationSchema();
const { buildApiUrl } = useStrapi();

const unwrap = (value: unknown): Record<string, unknown> => {
    if (!value || typeof value !== "object") return {};
    const source = value as StrapiRecord;
    const nestedData = (source as { data?: unknown }).data;
    const nested = Array.isArray(nestedData) ? nestedData[0] : nestedData;
    const record = (
        nested && typeof nested === "object" ? nested : source
    ) as StrapiRecord;
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

const normalizeLink = (value: unknown, fallback = "/") => {
    if (typeof value !== "string") return fallback;
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const endpoint = computed(() =>
    buildApiUrl(
        `/api/legal-pages?filters[slug][$eq]=${encodeURIComponent(slug.value)}&populate=*`,
    ),
);

const asyncDataKey = computed(() => `legal-page-${slug.value}`);

const {
    data: response,
    pending,
    error,
} = await useAsyncData(
    asyncDataKey,
    async () => {
        return await $fetch<{ data?: unknown[] }>(endpoint.value);
    },
    {
        server: true,
        default: () => ({ data: [] }),
    },
);

if (error.value) {
    throw createError({
        statusCode: 500,
        statusMessage: "Unable to load this legal page right now.",
    });
}

const entry = computed(() => unwrap((response.value.data || [])[0]));

if (!entry.value.slug) {
    throw createError({ statusCode: 404, statusMessage: "Page not found." });
}

const legalPage = computed(() => {
    const e = entry.value;
    const seo = unwrap(e.seo);
    return {
        title: text(e.title, e.heading),
        slug: text(e.slug),
        description: text(e.description, e.shortDescription, e.subtitle),
        content: e.content,
        contentHtml: text(e.contentHtml, e.content_html, e.contentHTML),
        lastUpdated: text(e.lastUpdated, e.updatedAt, e.publishedAt),
        seo: {
            metaTitle: text(seo.metaTitle, seo.title),
            metaDescription: text(seo.metaDescription, seo.description),
            canonicalPath: normalizeLink(
                seo.canonicalPath,
                `/legal/${text(e.slug)}`,
            ),
            noindex: typeof seo.noindex === "boolean" ? seo.noindex : undefined,
            nofollow:
                typeof seo.nofollow === "boolean" ? seo.nofollow : undefined,
        },
        legalPages: asArray(e.legal_pages),
    };
});

const relatedLegalPages = computed(() =>
    legalPage.value.legalPages
        .filter((item) => text(item.slug) && text(item.slug) !== slug.value)
        .slice(0, 3)
        .map((item, index) => ({
            id: String(item.id ?? `related-legal-${index}`),
            title: text(item.title, item.heading, "Legal Page"),
            slug: text(item.slug),
            description: text(
                item.description,
                item.shortDescription,
                "Read the full legal document.",
            ),
            href: `/legal/${text(item.slug)}`,
        })),
);

const pageTitle = computed(() =>
    text(
        legalPage.value.seo.metaTitle,
        legalPage.value.title,
        `${slug.value.toUpperCase()} | Consulting Pros`,
    ),
);

const pageDescription = computed(() =>
    text(
        legalPage.value.seo.metaDescription,
        legalPage.value.description,
        "Consulting Pros FZC legal information and policies.",
    ),
);

const canonicalPath = computed(() => `/legal/${slug.value}`);

const { canonicalUrl } = usePageMeta({
    pageType: "page",
    title: pageTitle.value,
    description: pageDescription.value,
    canonicalPath: canonicalPath.value,
    noindex: legalPage.value.seo.noindex,
    nofollow: legalPage.value.seo.nofollow,
});

const pageUrl = `${siteUrl.value}${canonicalPath.value}`;
const breadcrumbId = `${pageUrl}#breadcrumb`;

const webPageSchema = buildWebPageSchema({
    canonicalUrl,
    siteUrl: siteUrl.value,
    id: `${pageUrl}#webpage`,
    name: pageTitle.value,
    description: pageDescription.value,
    inLanguage: defaults.siteLanguage || "en",
    breadcrumbId,
    publisher: `${siteUrl.value}/#organization`,
});

const breadcrumbSchema = buildBreadcrumbSchema({
    id: breadcrumbId,
    items: [
        { name: "Home", url: siteUrl.value },
        { name: "Legal", url: `${siteUrl.value}/legal` },
        { name: text(legalPage.value.title, "Legal Page"), url: pageUrl },
    ],
});

useJsonLd(
    computed(() => [organizationSchema.value, webPageSchema, breadcrumbSchema]),
);

/* Content renderer helpers */
const escapeHtml = (raw: string): string => {
    return raw
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
};

const hasHtmlTags = (raw: string): boolean => /<[^>]+>/.test(raw);

const renderBlockNode = (node: BlockNode): string => {
    if (!node) return "";

    if (node.type === "text") {
        const value = node.text || "";
        return hasHtmlTags(value) ? value : escapeHtml(value);
    }

    if (node.type === "link" && node.url) {
        const children = (node.children || [])
            .map((child) => renderBlockNode(child))
            .join("");
        return `<a href="${escapeHtml(node.url)}" target="_blank" rel="noopener noreferrer" class="text-[#006c4f] underline hover:text-[#004d38]">${children}</a>`;
    }

    switch (node.type) {
        case "paragraph": {
            const childrenArr = node.children || [];
            const first = childrenArr[0];
            if (childrenArr.length === 1 && first && first.type === "text") {
                const value = first.text || "";
                if (!value.trim()) return "";
                if (hasHtmlTags(value)) return value;
            }
            const children = childrenArr
                .map((child) => renderBlockNode(child))
                .join("");
            return `<p>${children}</p>`;
        }
        case "heading": {
            const children = (node.children || [])
                .map((child) => renderBlockNode(child))
                .join("");
            const level = Math.min(Math.max(node.level || 2, 1), 6);
            return `<h${level}>${children}</h${level}>`;
        }
        case "list": {
            const tag = node.format === "ordered" ? "ol" : "ul";
            const children = (node.children || [])
                .map((child) => renderBlockNode(child))
                .join("");
            return `<${tag}>${children}</${tag}>`;
        }
        case "list-item": {
            const children = (node.children || [])
                .map((child) => renderBlockNode(child))
                .join("");
            return `<li>${children}</li>`;
        }
        default:
            return (node.children || [])
                .map((child) => renderBlockNode(child))
                .join("");
    }
};

const renderBlocks = (blocks: unknown[]): string => {
    if (!Array.isArray(blocks)) return "";
    return blocks
        .map((block) => renderBlockNode(block as BlockNode))
        .join("\n");
};

const stripHtml = (html: string): string => {
    return html.replace(/<[^>]+>/g, "");
};

const decodeHtmlEntities = (html: string): string => {
    return html
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x2F;/g, "/")
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16)),
        );
};

const createSafeHeadingId = (
    rawText: string,
    index: number,
    existingIds: Set<string>,
): string => {
    let base = decodeHtmlEntities(stripHtml(rawText))
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    if (!base) {
        base = `section-${index + 1}`;
    }

    let id = base;
    let counter = 2;
    while (existingIds.has(id)) {
        id = `${base}-${counter}`;
        counter++;
    }
    existingIds.add(id);
    return id;
};

const renderedContent = computed(() => {
    const htmlContent = legalPage.value.contentHtml;

    if (htmlContent) {
        if (hasHtmlTags(htmlContent)) {
            return htmlContent.trim();
        }

        return htmlContent
            .trim()
            .split(/\n\n+/)
            .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
            .join("\n");
    }

    const content = legalPage.value.content;

    if (content === null || content === undefined) return "";

    if (typeof content === "string") {
        if (!content.trim()) return "";
        if (hasHtmlTags(content)) return content.trim();

        return content
            .trim()
            .split(/\n\n+/)
            .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
            .join("\n");
    }

    if (Array.isArray(content)) {
        return renderBlocks(content);
    }

    return "";
});

const enhancedLegalContent = computed(() => {
    const html = renderedContent.value;
    if (!html.trim()) {
        return {
            html: "",
            toc: [] as Array<{ id: string; label: string; level: 2 | 3 }>,
        };
    }

    const toc: Array<{ id: string; label: string; level: 2 | 3 }> = [];
    const existingIds = new Set<string>();
    let index = 0;

    const headingRegex = /<h([23])(\s+[^>]*)?>([\s\S]*?)<\/h\1>/gi;

    const enhancedHtml = html.replace(
        headingRegex,
        (
            match: string,
            levelNum: string,
            attrs: string | undefined,
            content: string,
        ) => {
            const level = Number(levelNum) as 2 | 3;
            const label = decodeHtmlEntities(stripHtml(content)).trim();
            if (!label) return match;

            const existingIdMatch = attrs?.match(/\sid=["']([^"']+)["']/i);
            const existingId = existingIdMatch?.[1];
            if (existingId) {
                if (!existingIds.has(existingId)) {
                    existingIds.add(existingId);
                    toc.push({ id: existingId, label, level });
                }
                return match;
            }

            const id = createSafeHeadingId(label, index, existingIds);
            index++;
            toc.push({ id, label, level });

            const tag = `h${level}`;
            if (attrs) {
                return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
            }
            return `<${tag} id="${id}">${content}</${tag}>`;
        },
    );

    return { html: enhancedHtml, toc };
});

const hasContent = computed(() => Boolean(renderedContent.value.trim()));

/* TOC active state */
const activeTocId = ref<string>("");

interface TocLink {
    id: string;
    href: string;
    label: string;
    level: 2 | 3;
    type: "content" | "section";
}

const tocLinks = computed<TocLink[]>(() =>
    enhancedLegalContent.value.toc.map((item) => ({
        id: item.id,
        href: `#${item.id}`,
        label: item.label,
        level: item.level,
        type: "content" as const,
    })),
);

watch(
    tocLinks,
    (links) => {
        const validIds = new Set(links.map((l) => l.id));
        if (!activeTocId.value || !validIds.has(activeTocId.value)) {
            activeTocId.value = links[0]?.id ?? "";
        }
    },
    { immediate: true },
);

const handleTocClick = (link: TocLink) => {
    activeTocId.value = link.id;
    if (import.meta.client) {
        const el = document.querySelector(link.href);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }
};

/* Scroll-based active state observer */
let tocObserver: IntersectionObserver | null = null;

const observeTocTargets = async () => {
    if (!import.meta.client) return;
    await nextTick();

    tocObserver?.disconnect();

    const selectors = tocLinks.value.map((l) => l.href).join(",");
    if (!selectors) return;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>(selectors));
    if (!nodes.length) return;

    tocObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    activeTocId.value = entry.target.id;
                }
            });
        },
        { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );

    nodes.forEach((node) => tocObserver?.observe(node));
};

onMounted(() => {
    observeTocTargets();
});

watch(
    () => [pending.value, tocLinks.value] as const,
    ([isPending]) => {
        if (!isPending) {
            observeTocTargets();
        }
    },
);

onBeforeUnmount(() => {
    tocObserver?.disconnect();
});

/* Common fade-up reveal animation */
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
        { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
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
    <main ref="mainRef" class="min-h-screen bg-[#f9f9fb] text-[#001c2a]">
        <div
            v-if="pending"
            class="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8"
        >
            <p role="status" aria-live="polite" class="text-sm text-slate-600">
                Loading legal page...
            </p>
        </div>

        <template v-else>
            <!-- Hero -->
            <section
                data-reveal-id="hero"
                class="page-reveal relative"
                :class="{ 'is-visible': isSectionVisible('hero') }"
            >
                <div
                    class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(103,252,198,0.06),transparent_40%),radial-gradient(circle_at_90%_80%,rgba(0,28,42,0.04),transparent_40%)]"
                />

                <div
                    class="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
                >
                    <p class="eyebrow text-[#006c4f]">Legal Information</p>

                    <h1 class="mt-5 max-w-[900px]">
                        {{ legalPage.title || slug }}
                    </h1>

                    <p
                        v-if="legalPage.description"
                        class="mt-4 max-w-[65ch] text-[#41484c]"
                    >
                        {{ legalPage.description }}
                    </p>

                    <div
                        v-if="legalPage.lastUpdated"
                        class="mt-5 inline-flex items-center gap-2 rounded-full border border-[#e2e2e4]/80 bg-white px-4 py-2 text-sm text-[#72787d] shadow-sm"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            class="h-4 w-4 text-[#006c4f]"
                            aria-hidden="true"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        <span>Last updated: {{ legalPage.lastUpdated }}</span>
                    </div>
                </div>
            </section>

            <!-- Content layout -->
            <section id="overview">
                <div
                    class="mx-auto w-full max-w-[1180px] mt-4 lg:mt-16 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20"
                >
                    <div
                        class="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start"
                    >
                        <!-- Sidebar -->
                        <aside
                            class="min-w-0 lg:sticky lg:top-28 lg:self-start"
                        >
                            <div
                                data-reveal-id="sidebar"
                                class="page-reveal rounded-[2rem] border border-[#e2e2e4]/80 bg-[#f3f3f5]/80 p-7 shadow-[0_18px_45px_rgba(0,28,42,0.08)]"
                                :class="{
                                    'is-visible': isSectionVisible('sidebar'),
                                }"
                            >
                                <h2 class="text-base font-bold text-[#001c2a]">
                                    Legal Navigation
                                </h2>
                                <p
                                    v-if="legalPage.lastUpdated"
                                    class="mt-1 text-xs text-[#72787d]"
                                >
                                    Last updated:
                                    {{ legalPage.lastUpdated }}
                                </p>
                                <div class="my-4 h-px bg-[#e2e2e4]/80" />
                                <nav aria-label="Legal page sections">
                                    <ul class="space-y-1">
                                        <li
                                            v-for="link in tocLinks"
                                            :key="link.id"
                                        >
                                            <button
                                                type="button"
                                                :class="[
                                                    'w-full rounded-r-xl py-2.5 pr-3 text-left text-sm transition-colors',
                                                    link.level === 3
                                                        ? 'pl-6'
                                                        : 'pl-4',
                                                    activeTocId === link.id
                                                        ? 'border-l-4 border-[#006c4f] bg-white font-semibold text-[#006c4f]'
                                                        : 'border-l-4 border-transparent text-[#1f3340] hover:border-[#006c4f]/30 hover:text-[#006c4f]',
                                                ]"
                                                @click="handleTocClick(link)"
                                            >
                                                {{ link.label }}
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </aside>

                        <!-- Main content -->
                        <div
                            data-reveal-id="content"
                            class="page-reveal min-w-0 space-y-6"
                            :class="{
                                'is-visible': isSectionVisible('content'),
                            }"
                        >
                            <!-- Content card -->
                            <article
                                id="details"
                                class="min-w-0 rounded-[1.5rem] bg-white/70 px-6 py-8 shadow-sm ring-1 ring-[#e2e2e4]/70 sm:px-10 sm:py-10 lg:bg-transparent lg:p-0 lg:shadow-none lg:ring-0"
                            >
                                <!-- v-html is used for Strapi CMS rich-text content (trusted source) -->
                                <div
                                    v-if="hasContent"
                                    class="legal-content max-w-[780px]"
                                    v-html="enhancedLegalContent.html"
                                />
                                <div
                                    v-else
                                    class="flex flex-col items-center justify-center py-14 px-4 text-center"
                                >
                                    <div
                                        class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f3f3f5] text-[#72787d]"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            class="h-6 w-6"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fill-rule="evenodd"
                                                d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z"
                                                clip-rule="evenodd"
                                            />
                                            <path
                                                d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z"
                                            />
                                        </svg>
                                    </div>
                                    <h3
                                        class="text-lg font-bold text-[#001c2a]"
                                    >
                                        Content coming soon
                                    </h3>
                                    <p class="mt-2 max-w-[40ch] text-[#41484c]">
                                        Legal content is being prepared and will
                                        be updated soon.
                                    </p>
                                    <p class="mt-1 text-sm text-[#72787d]">
                                        Please check back later or contact us
                                        for details.
                                    </p>
                                </div>
                            </article>

                            <!-- Support card -->
                            <div
                                id="contact"
                                class="relative max-w-[780px] overflow-hidden rounded-xl border border-[#e2e2e4]/80 bg-white p-5 shadow-sm sm:p-6"
                            >
                                <div
                                    class="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-[#67fcc6]/10 blur-2xl"
                                />
                                <div class="relative flex items-start gap-4">
                                    <span
                                        class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#006c4f]/10 text-[#006c4f]"
                                        aria-hidden="true"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            class="h-5 w-5"
                                        >
                                            <path
                                                fill-rule="evenodd"
                                                d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z"
                                                clip-rule="evenodd"
                                            />
                                        </svg>
                                    </span>
                                    <div class="flex-1">
                                        <h2
                                            class="text-base font-bold text-[#001c2a]"
                                        >
                                            Questions about this page?
                                        </h2>
                                        <p class="mt-1 text-sm text-[#41484c]">
                                            Contact Consulting Pros FZC and
                                            we'll help you find the right
                                            information.
                                        </p>
                                        <NuxtLink
                                            to="/contact"
                                            class="mt-3 inline-flex items-center justify-center rounded-full bg-[#006c4f] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#006c4f] focus:ring-offset-2"
                                        >
                                            Contact Us
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Related legal pages -->
            <section
                v-if="relatedLegalPages.length"
                id="related"
                data-reveal-id="related"
                class="page-reveal"
                :class="{ 'is-visible': isSectionVisible('related') }"
            >
                <div
                    class="mx-auto w-full max-w-[1180px] px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16"
                >
                    <h2 class="text-xl font-bold text-[#001c2a]">
                        Related Legal Pages
                    </h2>
                    <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <NuxtLink
                            v-for="page in relatedLegalPages"
                            :key="page.id"
                            :to="page.href"
                            class="group flex flex-col rounded-xl border border-[#e2e2e4]/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#c8d5df] hover:shadow-md"
                        >
                            <h3
                                class="text-sm font-bold text-[#001c2a] transition-colors group-hover:text-[#006c4f]"
                            >
                                {{ page.title }}
                            </h3>
                            <p
                                class="mt-2 flex-1 text-sm leading-relaxed text-[#41484c]"
                            >
                                {{ page.description }}
                            </p>
                            <span
                                class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#006c4f]"
                            >
                                Read more
                                <svg
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="h-4 w-4 transition-transform group-hover:translate-x-1"
                                >
                                    <path d="m7 4 6 6-6 6" />
                                </svg>
                            </span>
                        </NuxtLink>
                    </div>
                </div>
            </section>

            <!-- Final CTA -->
            <section
                data-reveal-id="cta"
                class="page-reveal"
                :class="{ 'is-visible': isSectionVisible('cta') }"
            >
                <div
                    class="mx-auto w-full max-w-295 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20"
                >
                    <div
                        class="relative overflow-hidden rounded-2xl bg-[#001c2a] px-6 py-8 text-center sm:px-10 lg:px-14 lg:py-10"
                    >
                        <div
                            class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(103,252,198,0.08),transparent_70%)]"
                        />
                        <div class="relative mx-auto max-w-[560px]">
                            <h2
                                class="text-xl font-bold text-white lg:text-2xl"
                            >
                                Need help understanding our policies?
                            </h2>
                            <p class="mt-2 text-sm text-[#a4cce6]">
                                Contact us and we'll guide you to the right
                                information.
                            </p>
                            <NuxtLink
                                to="/contact"
                                class="mt-5 inline-flex items-center justify-center rounded-full bg-[#67fcc6] px-5 py-2.5 text-sm font-bold text-[#002115] shadow-[0_10px_24px_rgba(103,252,198,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(103,252,198,0.28)] focus:outline-none focus:ring-2 focus:ring-[#67fcc6] focus:ring-offset-2"
                            >
                                Contact Us
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </section>
        </template>
    </main>
</template>

<style scoped>
.page-reveal {
    opacity: 0;
    transform: translateY(1.5rem);
    transition:
        opacity 0.7s ease-out,
        transform 0.7s ease-out;
}

.page-reveal.is-visible {
    opacity: 1;
    transform: translateY(0);
}

/* Rich text content styles */
.legal-content :deep(h2),
.legal-content :deep(h3) {
    scroll-margin-top: 7rem;
}

.legal-content :deep(h2) {
    font-size: clamp(1.35rem, 1.8vw, 1.75rem);
    line-height: 1.25;
    font-weight: 800;
    color: #001c2a;
    margin-top: 2.5rem;
    margin-bottom: 0.9rem;
}

.legal-content :deep(h2:first-child) {
    margin-top: 0;
}

.legal-content :deep(h3) {
    font-size: clamp(1.15rem, 1.5vw, 1.35rem);
    line-height: 1.3;
    font-weight: 700;
    color: #001c2a;
    margin-top: 1.8rem;
    margin-bottom: 0.7rem;
}

.legal-content :deep(h4) {
    font-size: 1.05rem;
    line-height: 1.35;
    font-weight: 700;
    color: #001c2a;
    margin-top: 1.4rem;
    margin-bottom: 0.5rem;
}

.legal-content :deep(p) {
    font-size: 1rem;
    line-height: 1.8;
    color: #1f3340;
    margin-bottom: 1rem;
}

.legal-content :deep(ul) {
    list-style: disc;
}

.legal-content :deep(ol) {
    list-style: decimal;
}

.legal-content :deep(ul),
.legal-content :deep(ol) {
    padding-left: 1.5rem;
    margin: 0.75rem 0 1.25rem;
}

.legal-content :deep(li) {
    margin-bottom: 0.45rem;
    line-height: 1.75;
    color: #1f3340;
}

.legal-content :deep(hr) {
    margin: 2rem 0;
    border: 0;
    border-top: 1px solid #e2e2e4;
}

.legal-content :deep(a) {
    color: #006c4f;
    text-decoration: underline;
    transition: color 0.25s ease;
}

.legal-content :deep(a:hover) {
    color: #004d38;
}

.legal-content :deep(strong) {
    font-weight: 700;
    color: #001c2a;
}

@media (prefers-reduced-motion: reduce) {
    .page-reveal,
    .page-reveal.is-visible {
        opacity: 1;
        transform: none;
        transition: none;
    }
}
</style>
