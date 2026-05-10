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
    <div className="bg-card/60 backdrop-blur-2xl rounded-[28px] border border-border/40 shadow-xl shadow-black/5 p-6 flex flex-col gap-6 group hover:-translate-y-1 transition-all duration-500">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color} shadow-2xl ${shadow} transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500`}>
          <Icon size={24} className="text-white" strokeWidth={2} />
        </div>
        <div
          className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl border ${
            trend === "up"
              ? "bg-green-500/10 text-green-600 border-green-500/20"
              : trend === "down"
              ? "bg-red-500/10 text-red-500 border-red-500/20"
              : "bg-amber-500/10 text-amber-600 border-amber-500/20"
          }`}
        >
          {trend === "up" ? <ArrowUpRight size={12} /> : trend === "down" ? <ArrowDownRight size={12} /> : <AlertTriangle size={12} />}
          {sub.split(' ')[0]}
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-foreground tracking-tighter leading-none">{value}</p>
        <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.15em] mt-2 opacity-80">{label}</p>
      </div>
    </div>
  );
}
