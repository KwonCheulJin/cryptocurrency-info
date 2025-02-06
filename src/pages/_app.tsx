import '@/styles/globals.css';
import { getQueryClient } from '@/utils';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  const query_client = getQueryClient();
  return (
    <QueryClientProvider client={query_client}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
