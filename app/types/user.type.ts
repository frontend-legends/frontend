export interface IAuthStore {
  user: IAuthStoreUser;
}

export interface IAuthStoreUser {
  avatarUrl: string | null;
  createdAt: string | null;
  defaultRole: string | null;
  displayName: string | null;
  email: string | null;
  emailVerified: boolean | null;
  id: string | null;
  isAnonymous: boolean | null;
  locale: string | null;
  metadata: unknown | null;
  phoneNumber: string | null;
  phoneNumberVerified: boolean | null;
  roles: string[] | null;
}

// export interface IAuthStoreGetters {

// }
