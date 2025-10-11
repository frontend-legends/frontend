import PATHS from "~/const/paths";
import { nhost } from "../../nhost.config";

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;
  if (to.path === PATHS.redirecting) return;

  const auth = await nhost.auth.isAuthenticatedAsync();

  const isToken = Boolean(
    localStorage.getItem("nhostRefreshToken") ? true : false
  );

  if (auth && isToken) {
    // AUTO AUTH REDIRECT
    if (to.fullPath.startsWith("/auth")) {
      return navigateTo("/");
    }
  }
  // NON AUTHORIZED
  else {
    if (!to.fullPath.startsWith("/auth")) {
      return navigateTo(PATHS.signin);
    }
  }
});
