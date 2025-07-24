// paths.ts

const PATHS = {
  // auth side:
  auth: "/auth",

  // app side:
  home: "/",
  about: "/about",
  chapter: "/content/:chapter",
  story: "/content/:chapter/:story",

  // system side:
  settings: "/settings",
  // profile: "/profile",

  // miscellaneous:
  notFound: "/404",
} as const;

export default PATHS;
