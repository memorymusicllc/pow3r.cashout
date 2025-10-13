/**
 * Sidebar Component
 * Main application sidebar navigation with routing
 * 
 * @version 1.0.0
 * @date 2025-10-12
 * @category Navigation
 * @tags sidebar, navigation, routing, menu
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Share2,
  TrendingUp,
  Users,
  Handshake,
  Settings,
  Menu,
  X,
  Zap,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  },
  {
    name: 'Listing Generator',
    href: '/listings',
    icon: FileText,
    description: 'Platform Templates'
  },
  {
    name: 'Auto-Responder',
    href: '/auto-responder',
    icon: MessageSquare,
    description: 'Template Management'
  },
  {
    name: 'Cross-Posting',
    href: '/cross-posting',
    icon: Share2,
    description: 'Scheduler & Tracker'
  },
  {
    name: 'Price Monitor',
    href: '/pricing',
    icon: TrendingUp,
    description: 'History & Adjustments'
  },
  {
    name: 'Lead Management',
    href: '/leads',
    icon: Users,
    description: 'Contact Tracking'
  },
  {
    name: 'Negotiation Tools',
    href: '/negotiation',
    icon: Handshake,
    description: 'Scripts & Templates'
  },
  {
    name: 'Performance',
    href: '/performance',
    icon: Target,
    description: 'Metrics & Insights'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configuration'
  },
];

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AC Selling Pro
                </h1>
                <p className="text-xs text-slate-400">Automation Dashboard</p>
              </div>
            </div>
          </div>

          {/* Product info */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">CNCUSA-HD-12L</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                  ACTIVE
                </span>
              </div>
              <div className="text-2xl font-bold text-white">$4,200</div>
              <div className="text-xs text-slate-400">12V DC • 10,000 BTU • New in Box</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-slate-800/50 hover:shadow-lg',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg'
                      : 'text-slate-300 hover:text-white'
                  )}
                >
                  <item.icon className={cn(
                    'mr-3 h-5 w-5 transition-colors',
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                  )} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-slate-500 group-hover:text-slate-400">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="text-xs text-slate-500 text-center">
              <div>Mid-Wilshire, LA (90036)</div>
              <div className="mt-1">Pickup Only • Cash/Venmo/Zelle</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
