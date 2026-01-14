import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { DefaultApolloClient } from '@vue/apollo-composable';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const graphqlUrl = config.public.graphqlUrl || 'http://localhost:4000/graphql';

  // HTTP connection to the API
  const httpLink = createHttpLink({
    uri: graphqlUrl,
    headers: {
      'content-type': 'application/json',
    },
  });

  // Middleware to add auth token to requests
  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('auth_token');

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  // Create Apollo Client
  const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
      },
      query: {
        fetchPolicy: 'no-cache',
      },
    },
  });

  // Provide apollo client to the app
  nuxtApp.vueApp.provide(DefaultApolloClient, apolloClient);

  // Provide apollo client as a property
  return {
    provide: {
      apolloClient,
    },
  };
});
