import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PEMUDA_BEJI_LOGO } from '../../assets/logo';
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  FileBarChart2,
  CreditCard,
  Settings,
  User,
  LogOut,
  X,
  QrCode,
} from 'lucide-react';

export type NavItemKey =
  | 'dashboard'
  | 'members'
  | 'transactions'
  | 'reports'
  | 'card'
  | 'profile'
  | 'settings';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();

  const handleTabClick = (tab: NavItemKey) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const isAdmin = user?.role === 'ADMIN';
  const isBendahara = user?.role === 'BENDAHARA';
  const isAnggota = user?.role === 'ANGGOTA';

  const navItems = [
    {
      key: 'dashboard' as NavItemKey,
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      key: 'members' as NavItemKey,
      label: 'Data Anggota',
      icon: Users,
      show: isAdmin || isBendahara,
    },
    {
      key: 'transactions' as NavItemKey,
      label: isAnggota ? 'Riwayat Transaksi' : 'Transaksi Tabungan',
      icon: ArrowLeftRight,
      show: true,
    },
    {
      key: 'reports' as NavItemKey,
      label: 'Laporan Keuangan',
      icon: FileBarChart2,
      show: isAdmin || isBendahara,
    },
    {
      key: 'card' as NavItemKey,
      label: isAnggota ? 'Kartu Anggota Saya' : 'Kartu Anggota Digital',
      icon: CreditCard,
      show: true,
    },
    {
      key: 'settings' as NavItemKey,
      label: 'Pengaturan',
      icon: Settings,
      show: isAdmin,
    },
    {
      key: 'profile' as NavItemKey,
      label: 'Profil Akun',
      icon: User,
      show: true,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#082B66] text-white flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={PEMUDA_BEJI_LOGO}
              alt="Logo Pemuda Beji"
              className="w-10 h-10 object-contain rounded-lg bg-white p-1 shadow-xs"
            />
            <div>
              <div className="font-bold text-sm tracking-tight text-white leading-tight">
                PEMUDA BEJI
              </div>
              <div className="text-[11px] text-white/70 font-medium">
                Tabungan & Kas
              </div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden text-white/70 hover:text-white p-1 rounded-md"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-white/50 uppercase tracking-wider">
            Menu Utama
          </div>

          {navItems
            .filter(item => item.show)
            .map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabClick(item.key)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-[#061B3A] text-white shadow-xs font-semibold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-white/70'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

          {/* Quick link to verification QR scanner / test */}
          <div className="pt-4 px-3 pb-2 text-[10px] font-semibold text-white/50 uppercase tracking-wider">
            Layanan Publik
          </div>
          <button
            onClick={() => handleTabClick('card')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <QrCode className="w-4 h-4 text-white/60" />
            <span>Verifikasi QR Anggota</span>
          </button>
        </div>

        {/* Bottom Profile Summary & Logout */}
        <div className="p-4 border-t border-white/10 bg-[#061B3A]/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs text-white">
              {user?.nama?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user?.nama}</div>
              <div className="text-[11px] text-white/60 capitalize font-mono">
                {user?.role.toLowerCase()}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-rose-600/30 rounded-lg transition-colors border border-white/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>
    </>
  );
};
