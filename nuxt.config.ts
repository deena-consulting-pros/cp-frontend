import { defineNuxtConfig } from "nuxt/config";
import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Manrope:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap",
        },
      ],
    },
  },
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: [".trycloudflare.com"],
    },
  },
  runtimeConfig: {
    strapiApiToken: "",
    public: {
      strapiUrl: "http://127.0.0.1:1337",
      siteUrl: "http://localhost:3000",
      siteName: "Consulting Pros",
      siteDescription: "",
      siteLogo: "",
      defaultOgImage: "",
      twitterSite: "",
      defaultCurrency: "",
      siteSlogan: "",
      siteSameAs: "",
      supportEmail: "",
      supportPhone: "",
      siteLanguage: "en",
      siteSearchUrl: "",
      businessStreetAddress: "",
      businessAddressLocality: "",
      businessAddressRegion: "",
      businessPostalCode: "",
      businessAddressCountry: "",
    },
  },
});
