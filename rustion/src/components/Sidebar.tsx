'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  Settings,
  FileText
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Задания", icon: FileText },
  { href: "/students", label: "Студенты", icon: Users },
  { href: "/schedule", label: "Расписание", icon: Calendar },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed top-0 left-0 h-full w-64 flex flex-col border-r border-gray-800 bg-zinc-900 shadow-xl z-10">
      <div className="px-4 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">RUStion</h1>
      </div>
      
      <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white",
                    pathname === item.href ? "bg-gray-800 text-white" : ""
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800 mt-auto">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-white font-medium">
            U
          </div>
          <div className="flex-1">
            <p className="text-sm text-white font-medium">Пользователь</p>
            <p className="text-xs text-gray-400">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
} 