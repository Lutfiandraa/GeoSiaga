import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 mt-4 mx-6 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-100 shadow-sm flex items-center justify-between px-6 sticky top-4 z-40">
      <div className="relative w-96 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search regional data..." 
          className="w-full pl-11 pr-4 py-2.5 bg-slate-100/50 border-transparent focus:bg-white focus:border-blue-500 rounded-xl text-sm outline-none transition-all"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-900">Admin User</p>
            <p className="text-[10px] font-bold text-slate-500">Jakarta Gov Dept</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
            <User className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
}
