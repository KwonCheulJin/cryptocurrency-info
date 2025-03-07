import { GetCandleChartResponse } from '@/domains/home/detail';
import * as d3 from 'd3';
export interface DataItemInterface {
  timestamp: Date;
  close_value: number;
}

function formatChartData(
  chart_data: GetCandleChartResponse['chart'] | undefined
) {
  const data_list: DataItemInterface[] =
    chart_data?.map(item => {
      return {
        timestamp: new Date(item.timestamp),
        close_value: parseFloat(item.close),
      };
    }) ?? [];

  return data_list;
}

function getRects(element: Element) {
  const rect = element.getBoundingClientRect();

  return {
    width: rect.width,
    height: rect.height,
  };
}

const CHART_MARGIN = {
  top: 20,
  bottom: 20,
  left: 0,
  right: 0,
};

function getScales(data: DataItemInterface[], width: number, height: number) {
  const x_domain = d3.extent(data, d => d.timestamp) as [Date, Date];
  const y_domain = d3.extent(data, d => d.close_value) as [number, number];

  const xScale = d3
    .scaleTime()
    .domain(x_domain)
    .range([CHART_MARGIN.left, width - CHART_MARGIN.right]);
  const yScale = d3
    .scaleLinear()
    .domain(y_domain)
    .range([height - CHART_MARGIN.bottom, CHART_MARGIN.top]);

  return { xScale, yScale };
}

export { formatChartData, getRects, getScales };
