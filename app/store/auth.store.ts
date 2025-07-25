import type { IAuthStore, IAuthStoreUser } from "~/types/user.interface";

import { defineStore } from "pinia";

export const useAuthStore = defineStore("authStore", {
  state: () =>
    ({
      user: {
        avatarUrl: null,
        createdAt: null,
        defaultRole: null,
        displayName: null,
        email: null,
        emailVerified: null,
        id: null,
        isAnonymous: null,
        locale: null,
        metadata: null,
        phoneNumber: null,
        phoneNumberVerified: null,
        roles: [],
      },
    }) as IAuthStore,
  getters: {
    getAuth: (state) => (state.user.id ? true : false),
    getUser: (state) => state.user,
    getUserId: (state) => state.user.id,
    getEmail: (state) => state.user.email,
    getLogin: (state) => state.user.displayName,
    getIsAdmin: (state) => (state.user.roles?.includes("admin") ? true : false),
  },
  actions: {
    setUser(userData: IAuthStoreUser): void {
      this.user = { ...userData };
    },
    setEmail(email: string): void {
      this.user.email = email;
    },
  },
});
