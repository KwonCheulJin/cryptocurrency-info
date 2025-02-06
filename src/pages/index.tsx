import {
  DEFAULT_SORT,
  getCurrencyListQueryOptions,
  getTickerListQueryOptions,
  HomeMain,
} from '@/domains/home';
import { getQueryClient } from '@/utils';
import {
  dehydrate,
  DehydratedState,
  HydrationBoundary,
  UseQueryOptions,
} from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import { ComponentProps } from 'react';

interface Props extends ComponentProps<typeof HomeMain> {
  dehydrate_state: DehydratedState;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const query_client = getQueryClient();

  const query_option_list: UseQueryOptions<any, Error>[] = [
    getTickerListQueryOptions({ sort_by: DEFAULT_SORT }),
    getCurrencyListQueryOptions(),
  ];

  await Promise.all(
    query_option_list.map(query_options =>
      query_client.prefetchQuery(query_options)
    )
  );

  const dehydrate_state = dehydrate(query_client);

  return {
    props: {
      dehydrate_state,
    },
  };
};

export default function Home({ dehydrate_state }: Props) {
  return (
    <HydrationBoundary state={dehydrate_state}>
      <HomeMain />
    </HydrationBoundary>
  );
}
