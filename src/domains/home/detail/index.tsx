import {
  ChartHandlerResult,
  GetCandleChartReturnType,
  INTERVAL_LIST,
} from '@/api/cryptocurrency/chart/types';
import {
  GetTickerInfoReturnType,
  TickerInfoHandlerResult,
} from '@/api/cryptocurrency/ticker/detail/types';
import { formatNumber } from '@/domains/home/utils';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useRouter } from 'next/router';

import { ChangeEventHandler, FC, useState } from 'react';

export type Interval = (typeof INTERVAL_LIST)[number];

interface Props {
  ticker: string;
  interval_for_initialize?: Interval;
}

export const CryptocurrencyDetailMain: FC<Props> = props => {
  const { ticker, interval_for_initialize } = props;

  const router = useRouter();

  const [interval, setInterval] = useState<Interval>(
    interval_for_initialize ?? INTERVAL_LIST[0]
  );

  const { data: ticker_info } = useQuery(getTickerInfoQueryOptions({ ticker }));
  const { data: chart } = useQuery(
    getCandleChartQueryOptions({ ticker, interval })
  );

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
      <ol>
        {INTERVAL_LIST.map(item => (
          <li key={`interval-item-${item}`}>
            <input
              type="radio"
              name="interval"
              checked={interval === item}
              value={item}
              id={item}
              onChange={handleChangeInterval}
            />
            <label htmlFor={item}>{item}</label>
          </li>
        ))}
      </ol>
      <section>
        <dl>
          <dt>티커</dt>
          <dd>{ticker_info?.target_currency.toUpperCase()}</dd>
        </dl>
        <dl>
          <dt>시가</dt>
          <dd>{formatNumber(ticker_info?.first ?? 0)}</dd>
        </dl>
        <dl>
          <dt>종가</dt>
          <dd>{formatNumber(ticker_info?.last ?? 0)}</dd>
        </dl>
        <dl>
          <dt>고가</dt>
          <dd>{formatNumber(ticker_info?.high ?? 0)}</dd>
        </dl>
        <dl>
          <dt>저가</dt>
          <dd>{formatNumber(ticker_info?.low ?? 0)}</dd>
        </dl>
        <dl>
          <dt>체결금액</dt>
          <dd>{formatNumber(ticker_info?.quote_volume ?? 0)}</dd>
        </dl>
        <dl>
          <dt>체결량</dt>
          <dd>{formatNumber(ticker_info?.target_volume ?? 0)}</dd>
        </dl>
      </section>
    </main>
  );
};

interface GetCandleChartQueryOptionParams {
  ticker: string;
  interval: Interval;
}

type GetCandleChartResponse = Extract<
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
