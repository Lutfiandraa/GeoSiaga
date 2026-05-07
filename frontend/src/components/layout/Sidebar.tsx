'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map as MapIcon, BarChart3, UploadCloud, Waves } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Flood Map', icon: MapIcon, path: '/map' },
  { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  { name: 'Data Upload', icon: UploadCloud, path: '/upload' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [displayText, setDisplayText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);
  const fullText = 'GeoSiaga';

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting && displayText === fullText) {
        setTimeout(() => setIsDeleting(true), 3000); // Pause before deleting
      } else if (isDeleting && displayText === '') {
        setTimeout(() => setIsDeleting(false), 500); // Pause before writing again
      } else {
        setDisplayText(
          isDeleting
            ? fullText.substring(0, displayText.length - 1)
            : fullText.substring(0, displayText.length + 1)
        );
      }
    }, isDeleting ? 100 : 150);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting]);

  return (
    <aside className="relative flex-shrink-0 w-64 h-full bg-black text-white z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
          <Waves className="w-6 h-6 text-white" />
        </div>
        <span className="font-black text-xl tracking-tight">
          {displayText}
          <span className="text-blue-500">.</span>
          <span className="animate-pulse font-light text-slate-500">|</span>
        </span>
      </div>

      <nav className="mt-8 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105" 
                  : "text-slate-400 hover:text-white hover:bg-zinc-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-8 left-0 w-full px-8">
        <div className="p-4 bg-zinc-900/50 rounded-2xl border border-slate-700/50">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Current Region</p>
          <p className="text-sm font-bold text-white">DKI Jakarta, ID</p>
        </div>
      </div>
    </aside>
  );
}
