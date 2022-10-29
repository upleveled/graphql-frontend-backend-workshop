import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import merge from 'deepmerge';
import { AppProps } from 'next/app';
import { useMemo } from 'react';

let _apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

function createIsomorphLink() {
  if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { SchemaLink } = require('@apollo/client/link/schema');
    // TODO: Change the location for this import
    const { schema } = require('./api/graphql');
    return new SchemaLink({ schema });
  } else {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { HttpLink } = require('@apollo/client/link/http');
    return new HttpLink({
      uri: '/api/graphql',
      credentials: 'same-origin',
    });
  }
}

function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: createIsomorphLink(),
    cache: new InMemoryCache(),
  });
}

// TODO: If you have initial state data that you received from
// server-side rendering (eg. a query in getServerSideProps),
// then you can use `initialState` here for that, passing
// from the page props
// https://github.com/vercel/next.js/blob/84720697e4f00bd77689153f7cf39421be9b1d25/examples/api-routes-apollo-server-and-client-auth/apollo/client.js#L34-L53
function initializeApollo(initialState: any = null) {
  const internalApolloClient = _apolloClient ?? createApolloClient();

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // get hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = internalApolloClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache);

    // Restore the cache with the merged data
    internalApolloClient.cache.restore(data);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return internalApolloClient;
  // Create the Apollo Client once in the client
  if (!_apolloClient) _apolloClient = internalApolloClient;

  return internalApolloClient;
}

function useApollo() {
  const store = useMemo(() => initializeApollo(), []);
  return store;
}

export default function App({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo();

  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
