import { DefaultApolloClient } from "@vue/apollo-composable";
import { createApolloClient } from "@nhost/apollo";
import { nhost } from "../../nhost.config";

export default defineNuxtPlugin((nuxtApp) => {
  const token = nhost.auth.getAccessToken();
  const headers = token
    ? {
        authorization: `Bearer ${token}`,
      }
    : {};

  const apolloClient = createApolloClient({
    nhost,
    fetchPolicy: "no-cache",
    connectToDevTools: true,
    publicRole: "public",
    headers,
  });

  nhost.auth.onAuthStateChanged((d) => {
    if (d === "SIGNED_OUT") {
      console.log("CLEAR STORE");
      apolloClient.clearStore();
    }
  });

  nuxtApp.vueApp.provide(DefaultApolloClient, apolloClient);
  nuxtApp.vueApp.provide("nhost", nhost);
  nuxtApp.vueApp.use(nhost);
});
