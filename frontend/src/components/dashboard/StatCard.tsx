import { AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  trend: "up" | "down" | "warn";
  icon: React.ElementType;
  color: string;
  shadow: string;
}

export function StatCard({ label, value, sub, trend, icon: Icon, color, shadow }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-black/6 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${color} shadow-md ${shadow}`}>
          <Icon size={22} className="text-white" strokeWidth={1.75} />
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
            trend === "up"
              ? "bg-green-50 text-green-600"
              : trend === "down"
              ? "bg-red-50 text-red-500"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {trend === "up" ? <ArrowUpRight size={13} /> : trend === "down" ? <ArrowDownRight size={13} /> : <AlertTriangle size={13} />}
          {sub}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1c1c1e] tracking-tight">{value}</p>
        <p className="text-xs text-[#1c1c1e]/50 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}
