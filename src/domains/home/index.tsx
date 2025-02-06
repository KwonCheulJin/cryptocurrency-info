import {
  CurrencyListHandlerResult,
  GetCurrencyListReturnType,
} from '@/api/cryptocurrency/currency/types';
import {
  GetTickerListReturnType,
  TickerListHandlerResult,
} from '@/api/cryptocurrency/ticker/types';
import { formatNumber } from '@/domains/home/utils';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { FC } from 'react';
interface Props {}

export const HomeMain: FC<Props> = () => {
  const { data: map } = useQuery(getCurrencyListQueryOptions());
  const { data: list } = useQuery(getTickerListQueryOptions());

  return (
    <main>
      <section>
        <ol>
          {list?.map(item => {
            const ticker = item.target_currency.toUpperCase();
            const diff = item.last - item.first;
            const rate = ((item.last - item.first) / item.first) * 100;
            return (
              <li key={`${item.target_currency}-${item.id}`}>
                <span>{ticker}</span>
                <br />
                <span>{map?.get(ticker)?.name}</span>
                <br />
                <span>{formatNumber(item.last)}</span>
                <br />
                <span>{rate.toFixed(2)}%</span>
                <br />
                <span>{diff.toFixed(2)}</span>
                <br />
                <span>{formatNumber(item.quote_volume, 0)}</span>
                <br />
                <span>{formatNumber(item.target_volume, 0)}</span>
                <br />
                <br />
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
};

type TickerListResponse = Extract<
  TickerListHandlerResult,
  GetTickerListReturnType
>;

export function getTickerListQueryOptions(): UseQueryOptions<
  TickerListResponse,
  Error,
  TickerListResponse['tickers']
> {
  return {
    queryKey: ['ticker-list'],
    queryFn: async () => {
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/tickers`
      );
      const data = await result.json();
      return data;
    },
    select: data => data.tickers,
  };
}

type CurrencyListResponse = Extract<
  CurrencyListHandlerResult,
  GetCurrencyListReturnType
>;

export function getCurrencyListQueryOptions(): UseQueryOptions<
  CurrencyListResponse,
  Error,
  Map<string, CurrencyListResponse['currencies'][number]>
> {
  return {
    queryKey: ['currency-list'],
    queryFn: async () => {
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/currencies`
      );

      const data = await result.json();

      return data;
    },
    select: data =>
      new Map<string, CurrencyListResponse['currencies'][number]>(
        data.currencies.map(currency => [currency.symbol, currency])
      ),
  };
}
