import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SwapLineChartProps = {
  data: any[]; // used for label of valye
} & React.HTMLAttributes<HTMLDivElement>;

export default function PairChart({ data }: SwapLineChartProps) {
  const colors = {
    gradient1: "#c923dd",
    gradient2: "#0b0629",
    stroke: "#c923dd",
  };

  return (
    <ResponsiveContainer>
      <AreaChart
        className="rounded-40 border border-pequod-white bg-gradient-to-r from-pequod-gray via-pequod-gray"
        data={data}
        margin={{
          top: 5,
          right: 6,
          left: 0,
          bottom: 5,
        }}
      >
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.gradient1} stopOpacity={0.34} />
            <stop offset="100%" stopColor={colors.gradient2} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" axisLine={false} tickLine={false} hide />
        <YAxis
          dataKey="value"
          axisLine={false}
          tickLine={false}
          tick={{fontSize: 10}}
          tickFormatter={(value: number) => `${value.toFixed(8)}`}
          dx={10}
          dy={20}
          domain={["auto", "auto"]}
        />
        <Tooltip
          cursor={{ stroke: colors.gradient1 }}
          contentStyle={{ display: "none" }}
        />
        <Area
          dataKey="value"
          type="linear"
          stroke={colors.stroke}
          fill="url(#gradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
