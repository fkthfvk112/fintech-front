"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PortfolioSlice } from "@/rebalancing/interface/types";
import { formatGroupedNumber } from "@/lib/rebalancing/money";

/** High-contrast palette for easy slice distinction */
const COLORS = [
  "#F43F5E", // rose
  "#F59E0B", // amber
  "#22C55E", // green
  "#06B6D4", // cyan
  "#3B82F6", // blue
  "#A855F7", // purple
  "#EC4899", // pink
  "#84CC16", // lime
  "#F97316", // orange
  "#14B8A6", // teal
  "#EAB308", // yellow
  "#6366F1", // indigo
];

interface PortfolioPieChartProps {
  slices: PortfolioSlice[];
  emptyLabel: string;
}

type ChartRow = {
  id: string;
  name: string;
  value: number;
  weight: number;
};

export function PortfolioPieChart({ slices, emptyLabel }: PortfolioPieChartProps) {
  const data: ChartRow[] = slices.filter((s) => s.value > 0 && s.weight > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="70%"
            innerRadius="42%"
            paddingAngle={data.length > 1 ? 1.5 : 0}
            stroke="#fff"
            strokeWidth={1}
          >
            {data.map((entry, index) => (
              <Cell
                key={entry.id}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, _name, item) => {
              const row = item?.payload as ChartRow | undefined;
              const amount =
                typeof value === "number"
                  ? formatGroupedNumber(value, { maxFractionDigits: 2 })
                  : String(value ?? "");
              const weight = row
                ? formatGroupedNumber(row.weight, { maxFractionDigits: 2 })
                : "";
              return [`${amount} (${weight}%)`, row?.name ?? ""];
            }}
            contentStyle={{
              borderRadius: 12,
              borderColor: "#e2e8f0",
              fontSize: 12,
            }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            formatter={(value, entry) => {
              const row = entry.payload as ChartRow | undefined;
              const weight = row
                ? formatGroupedNumber(row.weight, { maxFractionDigits: 2 })
                : "";
              return `${value} ${weight}%`;
            }}
            wrapperStyle={{ fontSize: 12, color: "#334155" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
