"use client";

import { Users, Plus, Search, Shield, UserCheck } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1c1c1e] tracking-tight">Users</h1>
          <p className="text-sm text-[#1c1c1e]/50 mt-0.5">Manage team members and permissions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/30">
          <Plus size={16} strokeWidth={2.5} /> Invite User
        </button>
      </div>
      <div className="flex items-center gap-2 bg-black/[0.04] rounded-xl px-3 py-2.5 border border-black/[0.06]">
        <Search size={16} className="text-[#1c1c1e]/40 shrink-0" />
        <input type="text" placeholder="Search users…" className="flex-1 bg-transparent text-sm text-[#1c1c1e] placeholder:text-[#1c1c1e]/40 outline-none" />
      </div>
      <div className="flex items-center gap-3">
        {[{ label: "Admin", color: "bg-purple-500" }, { label: "Member", color: "bg-blue-500" }].map((role) => (
          <div key={role.label} className="flex items-center gap-1.5 text-xs text-[#1c1c1e]/50">
            <span className={`w-2 h-2 rounded-full ${role.color}`} />{role.label}
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-black/10 bg-black/[0.01]">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500 shadow-lg shadow-purple-500/25">
          <Users size={32} className="text-white" strokeWidth={1.5} />
        </div>
        <p className="text-[15px] font-semibold text-[#1c1c1e]">No users yet</p>
        <p className="text-sm text-[#1c1c1e]/50">Invite team members to collaborate</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
          <Plus size={16} strokeWidth={2.5} /> Invite User
        </button>
      </div>
    </div>
  );
}