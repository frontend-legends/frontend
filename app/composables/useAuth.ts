import { useMutation, useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { useAuthStore } from '~/store/auth.store';
import type { IAuthStoreUser } from '~/types/user.type';

// GraphQL Queries & Mutations
const SIGN_IN_MUTATION = gql`
  mutation SignIn($email: String!, $password: String!) {
    sign_in(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        email_verified
        stories_finished
        created_at
      }
    }
  }
`;

const SIGN_UP_MUTATION = gql`
  mutation SignUp($email: String!, $password: String!, $name: String) {
    sign_up(email: $email, password: $password, name: $name) {
      token
      user {
        id
        email
        name
        email_verified
        stories_finished
        created_at
      }
    }
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      email_verified
      stories_finished
      created_at
    }
  }
`;

const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($token: String!) {
    verify_email(token: $token)
  }
`;

const RESEND_VERIFICATION_EMAIL_MUTATION = gql`
  mutation ResendVerificationEmail($email: String!) {
    resend_verification_email(email: $email)
  }
`;

const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($email: String!) {
    request_password_reset(email: $email)
  }
`;

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $new_password: String!) {
    reset_password(token: $token, new_password: $new_password)
  }
`;

export function useSignIn() {
  const authStore = useAuthStore();
  const { mutate, loading, error, onDone, onError } = useMutation(SIGN_IN_MUTATION);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await mutate({ email, password });

      if (result?.data?.sign_in) {
        const { token, user } = result.data.sign_in;

        // Store token
        localStorage.setItem('auth_token', token);

        // Store user in auth store
        authStore.setUser(transformUserToStore(user));

        return { success: true, user, needsEmailVerification: !user.email_verified };
      }

      return { success: false, error: 'Sign in failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Sign in failed' };
    }
  };

  return {
    signIn,
    isLoading: loading,
    error,
    onDone,
    onError,
  };
}

export function useSignUp() {
  const authStore = useAuthStore();
  const { mutate, loading, error, onDone, onError } = useMutation(SIGN_UP_MUTATION);

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const result = await mutate({ email, password, name });

      if (result?.data?.sign_up) {
        const { token, user } = result.data.sign_up;

        // Store token
        localStorage.setItem('auth_token', token);

        // Store user in auth store
        authStore.setUser(transformUserToStore(user));

        return { success: true, user, needsEmailVerification: !user.email_verified };
      }

      return { success: false, error: 'Sign up failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Sign up failed' };
    }
  };

  return {
    signUp,
    isLoading: loading,
    error,
    onDone,
    onError,
  };
}

export function useCurrentUser() {
  const authStore = useAuthStore();
  const { result, loading, error, refetch } = useQuery(ME_QUERY, {}, {
    fetchPolicy: 'network-only',
  });

  const user = computed(() => result.value?.me || null);

  // Update store when user data changes
  watch(user, (newUser) => {
    if (newUser) {
      authStore.setUser(transformUserToStore(newUser));
    }
  });

  return {
    user,
    loading,
    error,
    refetch,
  };
}

export function useVerifyEmail() {
  const { mutate, loading, error } = useMutation(VERIFY_EMAIL_MUTATION);

  const verifyEmail = async (token: string) => {
    try {
      const result = await mutate({ token });
      return { success: !!result?.data?.verify_email };
    } catch (err: any) {
      return { success: false, error: err.message || 'Email verification failed' };
    }
  };

  return {
    verifyEmail,
    isLoading: loading,
    error,
  };
}

export function useResendVerificationEmail() {
  const { mutate, loading, error } = useMutation(RESEND_VERIFICATION_EMAIL_MUTATION);

  const resendVerificationEmail = async (email: string) => {
    try {
      const result = await mutate({ email });
      return { success: !!result?.data?.resend_verification_email };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to resend verification email' };
    }
  };

  return {
    resendVerificationEmail,
    isLoading: loading,
    error,
  };
}

export function useRequestPasswordReset() {
  const { mutate, loading, error } = useMutation(REQUEST_PASSWORD_RESET_MUTATION);

  const requestPasswordReset = async (email: string) => {
    try {
      const result = await mutate({ email });
      return { success: !!result?.data?.request_password_reset };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset request failed' };
    }
  };

  return {
    requestPasswordReset,
    isLoading: loading,
    error,
  };
}

export function useResetPassword() {
  const { mutate, loading, error } = useMutation(RESET_PASSWORD_MUTATION);

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const result = await mutate({ token, new_password: newPassword });
      return { success: !!result?.data?.reset_password };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset failed' };
    }
  };

  return {
    resetPassword,
    isLoading: loading,
    error,
  };
}

export function useSignOut() {
  const authStore = useAuthStore();

  const signOut = () => {
    // Clear token
    localStorage.removeItem('auth_token');

    // Clear user store
    authStore.setUser({
      id: null,
      email: null,
      displayName: null,
      emailVerified: null,
      createdAt: null,
      avatarUrl: null,
      defaultRole: null,
      isAnonymous: null,
      locale: null,
      metadata: { stories: [] },
      phoneNumber: null,
      phoneNumberVerified: null,
      roles: [],
    } as any);
  };

  return {
    signOut,
  };
}

export function useOAuthSignIn() {
  const config = useRuntimeConfig();
  const backendUrl = config.public.backendUrl || 'http://localhost:4000';

  const signInWithProvider = (provider: 'google' | 'github') => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${backendUrl}/auth/${provider}`;
  };

  return {
    signInWithGoogle: () => signInWithProvider('google'),
    signInWithGitHub: () => signInWithProvider('github'),
  };
}

// Helper function to transform backend user to store format
function transformUserToStore(user: any): IAuthStoreUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.name,
    emailVerified: user.email_verified,
    createdAt: user.created_at,
    avatarUrl: null,
    defaultRole: 'user',
    isAnonymous: false,
    locale: 'en',
    metadata: { stories: [] },
    phoneNumber: null,
    phoneNumberVerified: false,
    roles: ['user'],
  } as IAuthStoreUser;
}

// Helper to check if user is authenticated
export function useIsAuthenticated() {
  const hasToken = () => {
    if (import.meta.server) return false;
    return !!localStorage.getItem('auth_token');
  };

  return {
    isAuthenticated: hasToken(),
  };
}
