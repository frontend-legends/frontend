import PATHS from "~/const/paths";
import { useAuthStore } from "~/store/auth.store";

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;
  if (to.path === PATHS.redirecting) return;

  const token = localStorage.getItem("auth_token");
  const isAuthenticated = !!token;

  if (isAuthenticated) {
    const authStore = useAuthStore();

    // Fetch user data if not in store (e.g., on page refresh)
    if (!authStore.user.id) {
      const config = useRuntimeConfig();
      const backendUrl = config.public.backendUrl || "http://localhost:4000";

      try {
        const response = await fetch(`${backendUrl}/graphql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `query Me { me { id email name email_verified stories_finished created_at } }`,
          }),
        });

        const data = await response.json();
        const user = data?.data?.me;

        if (user) {
          authStore.setUser({
            id: user.id,
            email: user.email,
            displayName: user.name,
            emailVerified: user.email_verified,
            createdAt: user.created_at,
            avatarUrl: null,
            defaultRole: "user",
            isAnonymous: false,
            locale: "en",
            metadata: { stories: [] },
            phoneNumber: null,
            phoneNumberVerified: false,
            roles: ["user"],
          });
        } else {
          // Token invalid or user not found - clear auth
          localStorage.removeItem("auth_token");
          return navigateTo(PATHS.signin);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    }

    const emailVerified = authStore.user.emailVerified;

    // If email not verified, only allow auth pages
    if (!emailVerified && !to.fullPath.startsWith("/auth")) {
      return navigateTo(PATHS.verifyemail);
    }

    // If email is verified, redirect away from ALL auth pages
    if (emailVerified && to.fullPath.startsWith("/auth")) {
      return navigateTo("/");
    }
  }
  // NON AUTHORIZED
  else {
    // Redirect to sign in if not authenticated and trying to access protected pages
    if (!to.fullPath.startsWith("/auth")) {
      return navigateTo(PATHS.signin);
    }
  }
});
