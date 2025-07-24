// uno.config.ts
import { defineConfig, presetTypography, presetWebFonts } from "unocss";

import presetUno from "@unocss/preset-uno";

export default defineConfig({
  presets: [
    presetUno(),
    presetWebFonts({
      provider: "bunny",
      fonts: {
        main: ["Space Grotesk:300,400,500,700"],
        sans: ["Inter:300,400,500,700,900"],
      },
    }),
    presetTypography(),
  ],

  theme: {
    colors: {
      primary: "var(--primary)",
      "semi-primary": "var(--semi-primary)",

      secondary: "var(--secondary)",
      "semi-secondary": "var(--semi-secondary)",

      light: "var(--light)",
      "semi-light": "var(--semi-light)",

      dark: "var(--dark)",
      "semi-dark": "var(--semi-dark)",

      gray: "var(--gray)",
      "semi-gray": "var(--semi-gray)",

      "on-dark": "var(--on-dark)",
      "on-light": "var(--on-light)",

      negative: "var(--negative)",
      positive: "var(--positive",
      warning: "var(--warning)",
    },

    breakpoints: {
      sm: "320px",
      md: "640px",
      lg: "1024px",
      xl: "1280px",
      xxl: "1520px",
    },
  },
  autocomplete: {
    //
  },

  shortcuts: {
    "max-width": "max-w-[var(--max-width)]",
    "text-ellipsis": "overflow-hidden text-ellipsis whitespace-nowrap",
  },
});
