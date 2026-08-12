"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StatusPoint = { status: string; count: number };
type TrendPoint = { date: string; revenueInPaise: number; orders: number };

type DashboardChartsProps = {
  ordersByStatus: StatusPoint[];
  salesTrend: TrendPoint[];
};

function formatRupeeTick(paise: number) {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}

export function DashboardCharts({
  ordersByStatus,
  salesTrend,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="admin-card p-4">
        <h3 className="admin-brand mb-3 text-lg">Orders by status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6d5c3" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#b76e79" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="admin-card p-4">
        <h3 className="admin-brand mb-3 text-lg">Sales trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6d5c3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={formatRupeeTick}
                tick={{ fontSize: 11 }}
                width={64}
              />
              <Tooltip
                formatter={(value) =>
                  formatRupeeTick(typeof value === "number" ? value : 0)
                }
              />
              <Line
                type="monotone"
                dataKey="revenueInPaise"
                stroke="#2c1810"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
