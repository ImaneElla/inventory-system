import { AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  trend: "up" | "down" | "warn";
  icon: React.ElementType;
  gradient: string;
  shadow: string;
}

export function StatCard({ label, value, sub, trend, icon: Icon, gradient, shadow }: StatCardProps) {
  return (
    <div
      className={`relative rounded-[28px] overflow-hidden p-6 flex flex-col gap-6 group hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 shadow-xl ${shadow} cursor-default`}
      style={{ background: gradient }}
    >
      {/* Decorative glow blob */}
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-white/5 blur-xl pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300">
          <Icon size={22} className="text-white" strokeWidth={2} />
        </div>
        <div
          className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl border ${
            trend === "up"
              ? "bg-white/20 text-white border-white/30"
              : trend === "down"
              ? "bg-white/20 text-white border-white/30"
              : "bg-white/20 text-white border-white/30"
          }`}
        >
          {trend === "up" ? <ArrowUpRight size={12} /> : trend === "down" ? <ArrowDownRight size={12} /> : <AlertTriangle size={12} />}
          {sub.split(" ")[0]}
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-3xl font-black text-white tracking-tighter leading-none">{value}</p>
        <p className="text-[11px] font-bold text-white/70 uppercase tracking-[0.15em] mt-2">{label}</p>
      </div>
    </div>
  );
}
