import PATHS from "~/const/paths";
import { nhost } from "../../nhost.config";

export default defineNuxtRouteMiddleware(async (to) => {
  // const auth = await nhost.auth.isAuthenticatedAsync();
  // // const isAdmin = user?.roles.includes("admin") ? true : false;
  // const isToken = Boolean(localStorage.getItem("nhostRefreshTokenId"));
  // if (auth && isToken) {
  //   // AUTO AUTH REDIRECT
  //   if (to.fullPath.startsWith("/auth")) {
  //     return navigateTo("/");
  //   }
  // }
  // // NON AUTHORIZED
  // else {
  //   if (!to.fullPath.startsWith("/auth")) {
  //     return navigateTo(PATHS.auth);
  //   }
  // }
});
