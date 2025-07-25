import PATHS from "~/const/paths";
import { nhost } from "../../nhost.config";

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const auth = await nhost.auth.isAuthenticatedAsync();

  // const isAdmin = user?.roles.includes("admin") ? true : false;
  const isToken = Boolean(
    localStorage.getItem("nhostRefreshToken") ? true : false
  );

  console.log("auth", auth);
  console.log("isToken", isToken);

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
