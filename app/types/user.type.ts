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
  metadata: IUserMetadata | null;
  phoneNumber: string | null;
  phoneNumberVerified: boolean | null;
  roles: string[] | null;
}

export interface IUserRoles {
  role: string;
}

export interface IUserMetadataItem {
  title: string;
  is_finished: boolean;
  last_updated: string;
}

export interface IUserMetadata {
  stories: IUserMetadataItem[];
}
