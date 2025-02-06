import { CryptocurrencyDetailMain, Interval } from '@/domains/home/detail';
import { GetServerSideProps } from 'next';
import { ComponentProps } from 'react';

interface Props extends ComponentProps<typeof CryptocurrencyDetailMain> {}

type Params = { ticker: string };

export const getServerSideProps: GetServerSideProps<
  Props,
  Params
> = async context => {
  const ticker = context.params?.ticker;
  const interval_for_initialize = context.query.interval as Interval;

  if (!ticker) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ticker,
      interval_for_initialize,
    },
  };
};
export default function CryptocurrencyDetailPage(props: Props) {
  return <CryptocurrencyDetailMain {...props} />;
}
