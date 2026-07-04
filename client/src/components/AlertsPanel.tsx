"use client";

import type { AlertItem } from "../lib/types";
import { ShieldAlert, ShieldCheck, Eye } from "lucide-react";

interface AlertsPanelProps {
  alerts: AlertItem[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <div className="bg-[#131b2e]/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 shadow-xl h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 border border-rose-500/20">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-slate-200 tracking-wide">Incident Response Log</h2>
      </div>

      {alerts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-800/80 rounded-xl bg-[#090d16]/50">
          <ShieldCheck className="w-10 h-10 text-emerald-400/60 mb-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Perimeter Secure • No Threats</p>
        </div>
      ) : (
        <ul className="flex-1 space-y-3 max-h-71.25 overflow-y-auto pr-1">
          {alerts.map((a) => (
            <li
              key={a._id}
              className="bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 hover:border-amber-500/60 rounded-xl px-4 py-3.5 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  <Eye className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-amber-100/90 font-semibold text-sm leading-relaxed">{a.message}</span>
                </div>
                <span className="text-[10px] font-black font-mono bg-slate-950 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-800 whitespace-nowrap shadow-sm">
                  {new Date(a.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}