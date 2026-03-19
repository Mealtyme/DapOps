import React from 'react';
import { cn } from '@/lib/utils';
import type { AppModule } from '../types';
import { LayoutDashboard, PackageOpen, TruckIcon, Boxes, ChevronRight, Activity, Upload, Command } from 'lucide-react';

const navItems = [
  { id: 'dashboard' as AppModule, label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'inbound' as AppModule, label: 'Inbound Tracker', icon: <PackageOpen size={16} /> },
  { id: 'outbound' as AppModule, label: 'Outbound Planning', icon: <TruckIcon size={16} /> },
  { id: 'inventory' as AppModule, label: 'Inventory & SKU', icon: <Boxes size={16} /> },
];

interface SidebarProps { active: AppModule; onNavigate: (m: AppModule) => void; alerts: { low: number; late: number }; }

export function Sidebar({ active, onNavigate, alerts }: SidebarProps) {
  return (
    <aside className="flex flex-col h-full border-r border-border" style={{ width: 'var(--sidebar-width)', background: 'hsl(220 14% 9%)' }}>
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(214 100% 60% / 0.15)', border: '1px solid hsl(214 100% 60% / 0.3)' }}>
          <Activity size={16} className="text-blue-400" />
        </div>
        <div>
          <div className="text-[13px] font-bold text-foreground leading-tight">DAP Canada</div>
          <div className="text-[10px] text-muted-foreground leading-tight tracking-wide uppercase">Ops Tracker</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] text-muted-foreground tracking-widest uppercase px-2 mb-2 font-medium">Modules</div>
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)}
              className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 text-left',
                isActive ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}>
              <span className={cn(isActive ? 'text-blue-400' : 'text-muted-foreground')}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.id === 'inbound' && alerts.low > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">{alerts.low}</span>}
              {item.id === 'outbound' && alerts.late > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold">{alerts.late}</span>}
              {isActive && <ChevronRight size={12} className="text-blue-400/60" />}
            </button>
          );
        })}
        <div className="text-[10px] text-muted-foreground tracking-widest uppercase px-2 mb-2 mt-4 font-medium">Analytics</div>
        <button onClick={() => onNavigate('command')}
          className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 text-left',
            active === 'command' ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          )}>
          <span className={cn(active === 'command' ? 'text-violet-400' : 'text-muted-foreground')}><Command size={16} /></span>
          <span className="flex-1">Command Center</span>
          {active === 'command' && <ChevronRight size={12} className="text-violet-400/60" />}
        </button>
        <div className="text-[10px] text-muted-foreground tracking-widest uppercase px-2 mb-2 mt-4 font-medium">Tools</div>
        <button onClick={() => onNavigate('import')}
          className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 text-left',
            active === 'import' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          )}>
          <span className={cn(active === 'import' ? 'text-blue-400' : 'text-muted-foreground')}><Upload size={16} /></span>
          <span className="flex-1">Data Import Hub</span>
          {active === 'import' && <ChevronRight size={12} className="text-blue-400/60" />}
        </button>
      </nav>
    </aside>
  );
}
