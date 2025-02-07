import {
  CurrencyListHandlerResult,
  GetCurrencyListReturnType,
} from '@/api/cryptocurrency/currency/types';
import {
  GetTickerListReturnType,
  TickerListHandlerResult,
} from '@/api/cryptocurrency/ticker/types';
import { api_getSavedTickerList } from '@/domains/home/api';
import Savebutton from '@/domains/home/Savebutton';
import { formatNumber, sortByName, sortByVolume } from '@/domains/home/utils';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';
interface Props {}
type SortType = 'volume' | 'name';
export const DEFAULT_SORT = 'volume';

const EngToKRStatus: Record<ReturnType<typeof getIncreaseStatus>, string> = {
  increase: '상승',
  decrease: '하락',
  same: '변동 없음',
};

export const HomeMain: FC<Props> = () => {
  /**
   * 정렬 기준
   * 1. 거래 금액순
   * 2. 이름순
   */
  const [sort_by, setSortBy] = useState<SortType>(DEFAULT_SORT);
  const { data: list } = useQuery(getTickerListQueryOptions({ sort_by }));
  const { data: map } = useQuery(getCurrencyListQueryOptions());
  const { data: saved_set } = useQuery(getSavedTickerSetQueryOptions());

  return (
    <main className="px-2">
      <header className="flex justify-between items-center py-[18px]">
        <h1 className="text-3xl font-bold">암호화폐 목록</h1>
        <div className="flex gap-2.5">
          <button
            onClick={() => setSortBy('volume')}
            className={sort_by === 'volume' ? 'font-extrabold' : ''}
          >
            거래금액순
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={sort_by === 'name' ? 'font-extrabold' : ''}
          >
            이름순
          </button>
        </div>
      </header>
      <section>
        <ol className="flex flex-col gap-2.5">
          {list?.map(item => {
            const ticker = item.target_currency.toUpperCase();
            const diff = item.last - item.first;
            const rate = ((item.last - item.first) / item.first) * 100;

            const status = getIncreaseStatus(diff);
            const priceColor = getPriceColorByStatus(status);
            return (
              <li key={`${item.target_currency}-${item.id}`}>
                <Link
                  href={`/${ticker}`}
                  className="grid p-2 rounded-lg hover:bg-[#efefef] grid-cols-[auto_1fr_auto_70px_150px_auto] grid-rows-[auto_auto] gap-x-4"
                >
                  <span className="row-start-1 row-end-3 self-center">
                    <Image
                      width={24}
                      height={24}
                      src={`/${status}.svg`}
                      alt={`${EngToKRStatus} 아이콘`}
                    />
                  </span>
                  <span className="col-start-2 col-end-3 text-sm">
                    {ticker}
                  </span>
                  <span className="col-start-2 col-end-3 text-sm">
                    {map?.get(ticker)?.name}
                  </span>
                  <span
                    className={`col-start-3 col-end-4 row-start-1 row-end-3 font-bold ${priceColor}`}
                  >
                    {formatNumber(item.last)}
                  </span>
                  <span
                    className={`col-start-4 col-end-5 row-start-1 row-end-2 text-sm ${priceColor}`}
                  >
                    {rate.toFixed(2)}%
                  </span>
                  <span
                    className={`col-start-4 col-end-5 row-start-2 row-end-3 text-xs ${priceColor}`}
                  >
                    {diff.toFixed(2)}
                  </span>
                  <span className="col-start-5 col-end-6 row-start-1 row-end-2 text-sm text-right">
                    {formatNumber(item.quote_volume, 0)}
                  </span>
                  <span className="col-start-5 col-end-6 row-start-2 row-end-3 text-xs text-right">
                    {formatNumber(item.target_volume, 0)}
                  </span>
                  <Savebutton
                    ticker={ticker}
                    is_saved={!!saved_set?.has(ticker)}
                    className="col-start-6 col-end-7 row-start-1 row-end-3"
                  />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
};

export type TickerListResponse = Extract<
  TickerListHandlerResult,
  GetTickerListReturnType
>;

export function getTickerListQueryOptions(params: {
  sort_by: SortType;
}): UseQueryOptions<TickerListResponse, Error, TickerListResponse['tickers']> {
  const { sort_by } = params;
  return {
    queryKey: ['ticker-list'],
    queryFn: async () => {
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/tickers`
      );
      const data = await result.json();
      return data;
    },
    select: data => {
      const sorted_list =
        sort_by === 'volume'
          ? sortByVolume(data.tickers)
          : sortByName(data.tickers);
      return sorted_list;
    },
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

export const SAVED_TICKER_LIST_KEY = ['saved-ticker-list'];

function getSavedTickerSetQueryOptions(): UseQueryOptions<
  string[],
  Error,
  Set<string>
> {
  return {
    queryKey: SAVED_TICKER_LIST_KEY,
    queryFn: async () => {
      const result = await api_getSavedTickerList();
      return result;
    },
    select: data => {
      return new Set(data);
    },
  };
}

function getIncreaseStatus(diff: number) {
  if (diff > 0) {
    return 'increase';
  }

  if (diff < 0) {
    return 'decrease';
  }

  return 'same';
}

function getPriceColorByStatus(status: ReturnType<typeof getIncreaseStatus>) {
  if (status === 'increase') {
    return 'text-red-500';
  }
  if (status === 'decrease') {
    return 'text-blue-500';
  }

  return 'text-gray-500';
}
