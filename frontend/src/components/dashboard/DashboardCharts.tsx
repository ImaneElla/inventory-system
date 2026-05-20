"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.95)",
  border: "1px solid rgba(0,0,0,0.06)",
  borderRadius: "16px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  fontSize: "12px",
  fontWeight: 600,
};

export function InventoryProfitTrendChart({
  data,
  inventoryValue,
  expectedProfit,
}: {
  data: { label: string; revenue: number }[];
  inventoryValue: number;
  expectedProfit: number;
}) {
  const chartData = data.map((point) => ({
    label: point.label,
    inventoryValue: Number(inventoryValue ?? 0),
    expectedProfit: Number(expectedProfit ?? 0),
  }));

  const values = chartData.flatMap((point) => [point.inventoryValue, point.expectedProfit]);
  const yMin = values.length > 0 ? Math.min(0, ...values) : 0;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 16, right: 24, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          tickFormatter={(value) => `${Number(value).toLocaleString()}`}
          domain={[yMin, "auto"]}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value, name) => [
            `${Number(value ?? 0).toLocaleString()} DH`, 
            name === "inventoryValue" ? "Inventory value" : "Profit",
          ]}
        />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: "#64748b" }}
        />
        <Line
          type="monotone"
          dataKey="inventoryValue"
          name="Inventory value"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="expectedProfit"
          name="Profit"
          stroke="#22c55e"
          strokeWidth={3}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MostActiveDayChart({
  data,
}: {
  data: { day: string; count: number }[];
}) {
  const peak = data.reduce(
    (max, d) => (d.count > max.count ? d : max),
    data[0] ?? { day: "", count: 0 }
  );

  const values = data.map((item) => item.count);
  const yMin = values.length > 0 ? Math.min(0, ...values) : 0;

  return (
    <div className="relative">
      {peak.count > 0 && (
        <p className="text-center text-[10px] font-black text-primary mb-2">
          Peak: {peak.day} · {peak.count.toLocaleString()} sales
        </p>
      )}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            domain={[yMin, "auto"]}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [Number(value ?? 0), "Sales"]} />
          <Bar dataKey="count" radius={[10, 10, 10, 10]} maxBarSize={36}>
            {data.map((entry) => (
              <Cell
                key={entry.day}
                fill={entry.day === peak.day ? "#3b82f6" : "#c7d2fe"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RepeatCustomerGauge({ rate }: { rate: number }) {
  const chartData = [
    { name: "repeat", value: rate },
    { name: "rest", value: Math.max(0, 100 - rate) },
  ];

  return (
    <div className="relative flex items-center justify-center h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius={58}
            outerRadius={78}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="#22c55e" />
            <Cell fill="#e2e8f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <p className="text-3xl font-black text-foreground">{rate}%</p>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
          Repeat customers
        </p>
      </div>
    </div>
  );
}
