// paths.ts

const PATHS = {
  // auth side:
  signin: "/auth/sign-in",
  signup: "/auth/sign-up",
  verifyemail: "/auth/verify-email",
  resetpassword: "/auth/reset-password",
  redirecting: "/auth/redirecting",

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
