"use client";

// @memorylane/web - Component: Dashboard Sidebar
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore, selectPlan, selectIsAdmin } from '@/stores/auth-store';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Upload,
  Sparkles,
  CreditCard,
  Settings,
  History,
  X,
  ChevronLeft,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: '仪表盘', href: '/dashboard', icon: LayoutDashboard },
  { name: '上传照片', href: '/upload', icon: Upload },
  {
    name: 'AI 服务',
    href: '/services',
    icon: Sparkles,
    children: [
      { name: '照片动画', href: '/services/animation' },
      { name: '记忆视频', href: '/services/memory-video' },
      { name: '历史年代', href: '/services/historical-dating' },
      { name: '年代上色', href: '/services/era-colorization' },
      { name: '人脸匹配', href: '/services/face-match' },
      { name: '档案证书', href: '/services/certificate' },
    ],
  },
  { name: '历史记录', href: '/history', icon: History },
  { name: '账单', href: '/billing', icon: CreditCard },
  { name: '设置', href: '/settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const plan = useAuthStore(selectPlan);
  const isAdmin = useAuthStore(selectIsAdmin);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-100',
          'flex flex-col transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-lg font-display font-bold text-primary-800">
              MemoryLane
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan badge */}
        <div className="px-4 py-3">
          <Badge variant={plan === 'free' ? 'default' : 'gold'} size="md">
            {plan === 'free' ? '免费版' : plan === 'pro' ? '专业版' : '无限版'}
          </Badge>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-800'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {item.name}
                </Link>

                {/* Sub-navigation for Services */}
                {item.children && isActive && (
                  <div className="ml-8 mt-1 space-y-0.5 border-l-2 border-accent/20 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onClose}
                        className={cn(
                          'block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                          pathname === child.href
                            ? 'text-accent bg-accent/5'
                            : 'text-gray-500 hover:text-primary-800 hover:bg-gray-50'
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Admin link — only for Unlimited users */}
        {isAdmin && (
          <div className="px-3 pb-1">
            <Link
              href="/admin"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                pathname === '/admin'
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-800'
              )}
            >
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              管理后台
            </Link>
          </div>
        )}

        {/* Upgrade CTA */}
        {plan === 'free' && (
          <div className="p-4 border-t border-gray-100">
            <Link href="/pricing">
              <button className="w-full btn-gold text-sm py-2.5">
                升级专业版
              </button>
            </Link>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>
    </>
  );
}
