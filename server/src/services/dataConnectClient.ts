import { GraphQLClient } from 'graphql-request';
import { GoogleAuth } from 'google-auth-library';

const endpoint = process.env.DATACONNECT_GRAPHQL_URL as string;

if (!endpoint) {
  // Intentionally do not throw on import to keep Functions cold-start light; callers should guard
  // eslint-disable-next-line no-console
  console.warn('[DataConnect] DATACONNECT_GRAPHQL_URL is not set');
}

const auth = new GoogleAuth();

export async function getDataConnectClient(): Promise<GraphQLClient> {
  if (!endpoint) {
    throw new Error('DATACONNECT_GRAPHQL_URL not configured');
  }
  const idTokenClient = await auth.getIdTokenClient(endpoint);
  const headers = await idTokenClient.getRequestHeaders();
  return new GraphQLClient(endpoint, { headers });
}


