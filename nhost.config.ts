import { NhostClient } from "@nhost/vue";

export const nhost = new NhostClient({
  subdomain: process.env.NUXT_NHOST_SUBDOMAIN || "idkmnbpbvgyempgmdcld",
  region: process.env.NUXT_NHOST_REGION || "eu-central-1",
  devTools: true,
  autoRefreshToken: true,
  autoSignIn: false,
});
