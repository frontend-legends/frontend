import Inspect from "vite-plugin-inspect";
import { NUXT_LANGS } from "./LANGS";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/icon",
    "@unocss/nuxt",
    "nuxt-quasar-ui",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/mdc",
  ],

  vite: {
    logLevel: "error",

    plugins: [Inspect()],
  },

  app: {
    baseURL: "/",

    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      script: [
        // { src: "https://awesome-lib.js" },
      ],
      link: [],
      style: [],
      // noscript: [{ children: "JavaScript is required" }],
    },
  },

  // runtimeConfig: {
  //   nhostGraphqlUrl: process.env.NHOST_GRAPHQL_URL,
  //   nhostAdminSecret: process.env.NHOST_ADMIN_SECRET,
  // },

  // plugins: [{ src: "~/plugins/nhost-apollo.js", mode: "client" }],

  router: {
    options: {
      scrollBehaviorType: "smooth",
      linkActiveClass: "active-link",
    },
  },

  pinia: {
    storesDirs: ["./store/*.store.ts"],
  },

  content: {
    build: {
      markdown: {
        highlight: {
          langs: [...NUXT_LANGS],
          theme: {
            default: "one-light",
            dark: "one-dark-pro",
          },
        },
        toc: {
          depth: 3,
        },
      },
    },
  },

  // https://www.docs4.dev/posts/how-to-render-markdown-in-nuxt-3-and-highlight-syntax-nuxt-mdc
  mdc: {
    components: {},
  },

  quasar: {
    plugins: ["AppFullscreen", "LoadingBar", "Loading", "Dialog", "Notify"],

    config: {
      brand: {
        primary: "#1758ee",
        secondary: "#8cf424",
        // accent:
        dark: "#000000",
        // "dark-page":
        negative: "#ee3e3e",
        positive: "#1be67f",
        // info:
        // warning:
      },

      notify: {
        timeout: 3500,
        progress: true,
        position: "top-right",
      },
    },

    components: {
      defaults: {
        QBtn: {
          dense: false,
          unelevated: true,
          noCaps: true,
          noWrap: true,
          square: true,
        },
        QLinearProgress: {
          color: "secondary",
          size: "15px",
          stripe: true,
        },
        QCircularProgress: {
          color: "primary",
          indeterminate: true,
        },
        QSelect: {
          outlined: true,
          dense: false,
          square: true,
        },
        QInput: {
          outlined: true,
          square: true,
        },
        QToggle: {
          color: "primary",
        },
        QChip: {
          color: "primary",
        },
      },
    },

    lang: "en-US",
  },

  ssr: false,
  spaLoadingTemplate: true,

  css: ["~/styles/reset.css", "~/styles/app.css"],

  experimental: {
    viewTransition: true,
    writeEarlyHints: true,
    defaults: {
      useAsyncData: {
        deep: false,
      },
    },
  },

  dev: true,
});
