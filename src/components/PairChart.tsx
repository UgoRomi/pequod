import React, { useEffect, Dispatch, SetStateAction } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type SwapLineChartProps = {
  data: any[];
  setHoverValue: Dispatch<SetStateAction<number | undefined>>; // used for value on hover
  setHoverDate: Dispatch<SetStateAction<string | undefined>>; // used for label of valye
  isChangePositive: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

// Calls setHoverValue and setHoverDate when part of chart is hovered
// Note: this NEEDs to be wrapped inside component and useEffect, if you plug it as is it will create big render problems (try and see console)
const HoverUpdater = ({
  payload,
  setHoverValue,
  setHoverDate,
}: {
  payload: any;
  setHoverValue: any;
  setHoverDate: any;
}) => {
  useEffect(() => {
    setHoverValue(payload.value);
    setHoverDate(
      payload.time.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }, [payload.value, payload.time, setHoverValue, setHoverDate]);

  return null;
};

const getChartColors = ({
  isChangePositive,
}: {
  isChangePositive: boolean;
}) => {
  return isChangePositive
    ? { gradient1: '#ac91ff', gradient2: '#806cbd', stroke: '#7357c7' }
    : { gradient1: '#ED4B9E', gradient2: '#ED4B9E', stroke: '#ED4B9E ' };
};

export default function PairChart({
  data,
  setHoverValue,
  setHoverDate,
  isChangePositive,
}: SwapLineChartProps) {
  const colors = getChartColors({ isChangePositive });

  // if (!data || data.length === 0) {
  //   return <LineChartLoader />;
  // }
  return (
    <ResponsiveContainer>
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 0,
          left: 0,
          bottom: 5,
        }}
        onMouseLeave={() => {
          if (setHoverDate) setHoverDate(undefined);
          if (setHoverValue) setHoverValue(undefined);
        }}
      >
        <defs>
          <linearGradient id='gradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor={colors.gradient1} stopOpacity={0.34} />
            <stop offset='100%' stopColor={colors.gradient2} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey='time'
          axisLine={false}
          tickLine={false}
          minTickGap={8}
          hide
        />
        <YAxis
          dataKey='value'
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
          hide
        />
        <Tooltip
          cursor={{ stroke: '#a78bfa' }}
          contentStyle={{ display: 'none' }}
          formatter={(tooltipValue: any, name: any, props: any) => (
            <HoverUpdater
              payload={props.payload}
              setHoverValue={setHoverValue}
              setHoverDate={setHoverDate}
            />
          )}
        />
        <Area
          dataKey='value'
          type='linear'
          stroke={colors.stroke}
          fill='url(#gradient)'
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
