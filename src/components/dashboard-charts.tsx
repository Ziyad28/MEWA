import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartDatum = {
  value: number;
  month?: string;
  name?: string;
};

const tooltipStyle = {
  border: "1px solid #E2E8E5",
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(16,24,40,0.10)",
  fontSize: 12,
};

export function ProgressAreaChart({
  data,
  color = "#006C51",
  xKey = "month",
  label = "نسبة التقدم",
}: {
  data: ChartDatum[];
  color?: string;
  xKey?: "month" | "name";
  label?: string;
}) {
  const gradientId = `area-${useId().replace(/:/g, "")}`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 14, left: 0, bottom: 8 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="55%" stopColor={color} stopOpacity={0.08} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="4 5" stroke="#E7ECE9" />
        <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#667085" }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#667085" }} tickFormatter={(value) => `${value}%`} domain={[0, 100]} width={42} />
        <Tooltip
          cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4", strokeOpacity: 0.35 }}
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#344054", fontWeight: 600, marginBottom: 4 }}
          formatter={(value) => [`${value}%`, label]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={3.5}
          fill={`url(#${gradientId})`}
          dot={{ r: 4.5, fill: "#FFFFFF", strokeWidth: 3, stroke: color }}
          activeDot={{ r: 7, fill: color, stroke: "#FFFFFF", strokeWidth: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PerformanceBarChart({
  data,
  color = "#006C51",
  label = "مؤشر الأداء",
  layout = "vertical",
}: {
  data: ChartDatum[];
  color?: string;
  label?: string;
  layout?: "horizontal" | "vertical";
}) {
  const gradientId = `bar-${useId().replace(/:/g, "")}`;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout={layout}
        data={data}
        margin={{ top: 12, right: 20, left: 20, bottom: 8 }}
        barCategoryGap="28%"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2={layout === "vertical" ? "1" : "0"} y2={layout === "vertical" ? "0" : "1"}>
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.68} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={layout !== "vertical"}
          horizontal={layout === "vertical"}
          strokeDasharray="4 5"
          stroke="#E7ECE9"
        />
        {layout === "vertical" ? (
          <XAxis type="number" reversed={true} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#667085" }} tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
        ) : (
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#667085" }} dy={10} />
        )}
        {layout === "vertical" ? (
          <YAxis orientation="right" type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#344054", fontWeight: 500, textAnchor: "end", dx: 70 }} width={220} />
        ) : (
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#667085" }} tickFormatter={(value) => `${value}%`} domain={[0, 100]} width={42} />
        )}
        <Tooltip
          cursor={{ fill: `${color}0A` }}
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#344054", fontWeight: 600, marginBottom: 4 }}
          formatter={(value) => [`${value}%`, label]}
        />
        <Bar dataKey="value" fill={`url(#${gradientId})`} radius={layout === "vertical" ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={32} barSize={layout === "vertical" ? 16 : undefined} />
      </BarChart>
    </ResponsiveContainer>
  );
}
