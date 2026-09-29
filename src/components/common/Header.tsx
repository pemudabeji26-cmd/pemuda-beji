import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PEMUDA_BEJI_LOGO, DEFAULT_AVATAR } from '../../assets/logo';
import { LogOut, Menu, UserCheck, ShieldCheck, Wallet } from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { user, logout } = useAuth();

  const getRoleIcon = () => {
    if (user?.role === 'ADMIN') return <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />;
    if (user?.role === 'BENDAHARA') return <Wallet className="w-3.5 h-3.5 text-emerald-300" />;
    return <UserCheck className="w-3.5 h-3.5 text-slate-300" />;
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] shadow-xs px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Brand identity */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-hidden"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <img
              src={PEMUDA_BEJI_LOGO}
              alt="Logo Pemuda Beji"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-md"
            />
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold text-[#082B66] leading-tight tracking-tight">
                Tabungan Pemuda Beji
              </span>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline-block">
                Sistem Kas & Tabungan Anggota
              </span>
            </div>
          </div>
        </div>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 text-right">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-[#172033] leading-tight truncate max-w-[180px]">
                {user?.nama || user?.username}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                {getRoleIcon()}
                <span>{user?.role}</span>
                {user?.nomor_anggota && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-slate-600">{user.nomor_anggota}</span>
                  </>
                )}
              </div>
            </div>

            <img
              src={DEFAULT_AVATAR}
              alt="Avatar Pengguna"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 shadow-xs"
            />
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors focus:outline-hidden"
            title="Keluar dari akun"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
