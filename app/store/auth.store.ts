import { defineStore } from "pinia";
import type {
  IAuthStore,
  IAuthStoreUser,
  IUserMetadata,
  IUserMetadataItem,
} from "~/types/user.type";

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
        metadata: { stories: [] } as IUserMetadata | null,
        phoneNumber: null,
        phoneNumberVerified: null,
        roles: [],
      },
    }) as IAuthStore,

  getters: {
    getAuth: (state) => Boolean(state.user.id),
    getUser: (state) => state.user,
    getUserId: (state) => state.user.id,
    getEmail: (state) => state.user.email,
    getLogin: (state) => state.user.displayName,
    getUserMetadata: (state) => state.user.metadata,
    getUserStoriesLen: (state) => state.user.metadata?.stories.length,
  },

  actions: {
    setUser(userData: IAuthStoreUser): void {
      this.user = { ...userData };
      if (!this.user.metadata || !Array.isArray(this.user.metadata.stories)) {
        this.user.metadata = { stories: [] };
      }
    },

    setEmail(email: string): void {
      this.user.email = email;
    },

    setMetadata(metadata: IUserMetadata): void {
      this.user.metadata = metadata;
    },

    updateStoryProgress(storyTitle: string, finished: boolean): void {
      const now = new Date().toISOString();

      if (!this.user.metadata || !Array.isArray(this.user.metadata.stories)) {
        this.user.metadata = { stories: [] };
      }

      const existing = this.user.metadata.stories.find(
        (s: IUserMetadataItem) => s.title === storyTitle
      );

      if (existing) {
        existing.is_finished = finished;
        existing.last_updated = now;
      } else {
        this.user.metadata.stories.push({
          title: storyTitle,
          is_finished: finished,
          last_updated: now,
        });
      }
    },
  },
});
