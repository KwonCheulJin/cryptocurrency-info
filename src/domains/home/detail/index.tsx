import {
  ChartHandlerResult,
  GetCandleChartReturnType,
  INTERVAL_LIST,
} from '@/api/cryptocurrency/chart/types';
import {
  GetTickerInfoReturnType,
  TickerInfoHandlerResult,
} from '@/api/cryptocurrency/ticker/detail/types';
import DetailItem from '@/components/DetailItem';
import useChart from '@/domains/home/detail/hooks/useChart';
import useResizeObserver from '@/domains/home/detail/hooks/useResizeObserver';
import { formatChartData } from '@/domains/home/detail/utils';
import { formatNumber } from '@/domains/home/utils';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useRouter } from 'next/router';

import { ChangeEventHandler, FC, useMemo, useRef, useState } from 'react';

export type Interval = (typeof INTERVAL_LIST)[number];

interface Props {
  ticker: string;
  interval_for_initialize?: Interval;
}

export const CryptocurrencyDetailMain: FC<Props> = props => {
  const { ticker, interval_for_initialize } = props;

  const router = useRouter();

  const chart_ref = useRef<HTMLDivElement>(null);

  const [interval, setInterval] = useState<Interval>(
    interval_for_initialize ?? INTERVAL_LIST[0]
  );

  const { data: ticker_info } = useQuery(getTickerInfoQueryOptions({ ticker }));
  const { data: chart } = useQuery(
    getCandleChartQueryOptions({ ticker, interval })
  );

  const chart_data = useMemo(() => formatChartData(chart), [chart]);

  const { draw } = useChart({ chart_data });

  useResizeObserver({
    ref: chart_ref,
    callback: entry => {
      draw(entry.target);
      console.log(entry.contentRect.width);
    },
  });

  const handleChangeInterval: ChangeEventHandler<HTMLInputElement> = e => {
    const value = e.currentTarget.value as Interval;
    router.replace({
      pathname: router.pathname,
      query: { ...router.query, interval: value },
    });
    setInterval(value);
  };
  return (
    <main>
      <header className="h-[50px] flex items-center px-4">
        <h1 className="text-2xl font-bold">{ticker}</h1>
      </header>
      <div ref={chart_ref} className="h-[500px]" />
      <ol className="flex overflow-auto px-2.5 py-1.5 text-sm justify-center">
        {INTERVAL_LIST.map(item => (
          <li
            key={`interval-item-${item}`}
            className="block cursor-pointer px-2.5 py-1.5 border-r border-[#efefef] last:border-none"
          >
            <input
              type="radio"
              name="interval"
              checked={interval === item}
              value={item}
              id={item}
              onChange={handleChangeInterval}
              className="hidden"
            />
            <label
              htmlFor={item}
              className={`${
                interval === item ? 'text-red-500' : ''
              } p-1 cursor-pointer`}
            >
              {item}
            </label>
          </li>
        ))}
      </ol>
      <section className="p-4 flex flex-col gap-1.5">
        <DetailItem
          title={'티커'}
          desc={ticker_info?.target_currency.toUpperCase()}
        />
        <DetailItem
          title={'시가'}
          desc={formatNumber(ticker_info?.first ?? 0)}
        />
        <DetailItem
          title={'종가'}
          desc={formatNumber(ticker_info?.last ?? 0)}
        />
        <DetailItem
          title={'고가'}
          desc={formatNumber(ticker_info?.high ?? 0)}
        />
        <DetailItem title={'저가'} desc={formatNumber(ticker_info?.low ?? 0)} />
        <DetailItem
          title={'체결금액'}
          desc={formatNumber(ticker_info?.quote_volume ?? 0)}
        />
        <DetailItem
          title={'체결량'}
          desc={formatNumber(ticker_info?.target_volume ?? 0)}
        />
      </section>
    </main>
  );
};

interface GetCandleChartQueryOptionParams {
  ticker: string;
  interval: Interval;
}

export type GetCandleChartResponse = Extract<
  ChartHandlerResult,
  GetCandleChartReturnType
>;

function getCandleChartQueryOptions({
  ticker,
  interval,
}: GetCandleChartQueryOptionParams): UseQueryOptions<
  GetCandleChartResponse,
  Error,
  GetCandleChartResponse['chart']
> {
  return {
    queryKey: ['candle-chart', ticker, interval],
    queryFn: async () => {
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/chart/${ticker}`,
        {
          method: 'POST',
          headers: new Headers({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ interval }),
        }
      );
      const data = await result.json();
      return data;
    },
    select: data => data.chart,
  };
}

type GetTickerInfoResponse = Extract<
  TickerInfoHandlerResult,
  GetTickerInfoReturnType
>;

function getTickerInfoQueryOptions(params: {
  ticker: string;
}): UseQueryOptions<
  GetTickerInfoResponse,
  Error,
  GetTickerInfoResponse['tickers'][number] | undefined
> {
  const { ticker } = params;
  return {
    queryKey: ['ticker-info', ticker],
    queryFn: async () => {
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/tickers/${ticker}`
      );
      const data = result.json();
      return data;
    },
    select: data => data.tickers.at(0),
  };
}
