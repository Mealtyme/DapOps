import React from 'react';
import { cn } from '@/lib/utils';
import type { AppModule } from '../types';
import {
  LayoutDashboard,
  PackageOpen,
  TruckIcon,
  Boxes,
  ChevronRight,
  Activity,
  Upload,
  Command,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface NavItem {
  id: AppModule;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard',        icon: <LayoutDashboard size={16} /> },
  { id: 'inbound',   label: 'Inbound Tracker',  icon: <PackageOpen size={16} /> },
  { id: 'outbound',  label: 'Outbound Planning', icon: <TruckIcon size={16} /> },
  { id: 'inventory', label: 'Inventory & SKU',  icon: <Boxes size={16} /> },
];

interface SidebarProps {
  active: AppModule;
  onNavigate: (m: AppModule) => void;
  alerts: { low: number; late: number };
}

export function Sidebar({ active, onNavigate, alerts }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <aside
      className="flex flex-col h-full border-r border-white/10 flex-shrink-0"
      style={{ width: 'var(-sidebar-width)', background: 'hsl(var(--sidebar-bg))' }}
    >
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w8 h-8 rounded-lg flex items-center justify-center bg-blue-500/15 border border-blue-500/30">
          <Activity size={16} className="text-blue-400" />
        </div>
        <div>
          <div className="text-[13px] font-bold text-white leading-tight">DAP Canada</div>
          <div className="text-[10px] text-white/40 leading-tight tracking-wide uppercase">Ops Tracker</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] text-white/30 tracking-widest uppercase px-2 mb-2 font-medium">Modules</div>
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 text-left',
                isActive
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/25'
                  : 'text-white/45 hover:text-white/80 hover:bv-white/8',
              )}
            >
              <span className={cn(isActive ? 'text-blue-400' : 'text-white/40')}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.id === 'inbound' && alerts.low > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/25 text-amber-400 font-semibold">{alerts.low}</span>
              )}
              {item.id === 'outbound' && alerts.late > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/25 text-red-400 font-semibold">{alerts.late}</span>
              )}
              {isActive && <ChevronRight size={12} className="text-blue-400/60" />}
            </button>
          );
        })}
        <div className="text-[10px] text-white/30 tracking-widest uppercase px-2 mb-2 mt-4 font-medium">Analytics</div>
        <button
          onClick={() => onNavigate('command')}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 text-left',
            active === 'command'
              ? 'bg-violet-500/20 text-violet-400 border border-violet-500/25'
              : 'text-white/45 hover:text-white/80 hover:bv-white/8',
          )}
        >
          <span className={cn(active === 'command' ? 'text-violet-400' : 'text-white/40')}><Command size={16} /></span>
          <span className="flex-1">Command Center</span>
          {active === 'command' && <ChevronRight size={12} className="text-violet-400/60" />}
        </button>
        <div className="text-[10px] text-white/30 tracking-widest uppercase px-2 mb-2 mt-4 font-medium">Tools</div>
        <button
          onClick={() => onNavigate('import')}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 text-left',
            active === 'import'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/25'
              : 'text-white/45 hover:text-white/80 hover:bv-white/8',
          )}
        >
          <span className={cn(active === 'import' ? 'text-blue-400' : 'text-white/40')}><Upload size={16} /></span>
          <span className="flex-1">Data Import Hub</span>
          {active === 'import' && <ChevronRight size={12} className="text-blue-400/60" />}
        </button>
      </nav>
      <div className="px-3 pb-5 pt-3 border-t border-white/10">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-medium transition-all duration-200 text-white/50 hover:text-white/80 hover:bg-white/8"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="flex items-center justify-center w-5 h-5">
            {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-blue-300" />}
          </span>
          <span className="flex-1 text-left">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          <div className={cn('relative w-8 h-4 rounded-full transition-colors duration-300 flex-shrink-0', isDark ? 'bg-white/15' : 'bg-blue-400/60')}>
            <div className={cn('absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300', isDark ? 'left-0.5' : 'left-[17px]')} />
          </div>
        </button>
      </div>
    </aside>
  );
}