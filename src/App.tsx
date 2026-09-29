import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { Header } from './components/common/Header';
import { Sidebar, NavItemKey } from './components/common/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Members } from './pages/Members';
import { Transactions } from './pages/Transactions';
import { Reports } from './pages/Reports';
import { MemberCardPage } from './pages/MemberCardPage';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { VerifyMember } from './pages/VerifyMember';
import { Member } from './types';

function MainApp() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Cross-page state transfers
  const [selectedCardMember, setSelectedCardMember] = useState<Member | null>(null);
  const [initialTrxType, setInitialTrxType] = useState<'SETOR' | 'TARIK' | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Verification state (supports /verify/:id or ?tab=verify&id=...)
  const [verifyId, setVerifyId] = useState<string | null>(null);

  useEffect(() => {
    // Check initial URL parameters or path
    const urlParams = new URLSearchParams(window.location.search);
    const path = window.location.pathname;

    if (path.startsWith('/verify/')) {
      const idFromPath = path.replace('/verify/', '').trim();
      if (idFromPath) setVerifyId(idFromPath);
    } else if (urlParams.get('tab') === 'verify' && urlParams.get('id')) {
      setVerifyId(urlParams.get('id'));
    }
  }, []);

  // Listen for browser back / popstate
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const path = window.location.pathname;
      if (path.startsWith('/verify/')) {
        setVerifyId(path.replace('/verify/', '').trim());
      } else if (urlParams.get('tab') === 'verify' && urlParams.get('id')) {
        setVerifyId(urlParams.get('id'));
      } else {
        setVerifyId(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Public QR Code Verification View (No login needed)
  if (verifyId) {
    return (
      <VerifyMember
        memberId={verifyId}
        onBackToApp={() => {
          setVerifyId(null);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-slate-200 border-t-[#082B66] rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-600">
            Memuat Sistem Tabungan Pemuda Beji...
          </span>
        </div>
      </div>
    );
  }

  // If not logged in, show Login page
  if (!isAuthenticated) {
    return <Login />;
  }

  // Role validation & fallback
  const isAnggota = user?.role === 'ANGGOTA';
  const isBendahara = user?.role === 'BENDAHARA';

  const handleSelectTab = (tab: NavItemKey) => {
    // Prevent unauthorised navigation
    if (isAnggota && (tab === 'members' || tab === 'reports' || tab === 'settings')) {
      setCurrentTab('dashboard');
      return;
    }
    if (isBendahara && tab === 'settings') {
      setCurrentTab('dashboard');
      return;
    }

    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewMemberCard = (member: Member) => {
    setSelectedCardMember(member);
    setCurrentTab('card');
  };

  const handleOpenDepositModal = () => {
    setInitialTrxType('SETOR');
    setCurrentTab('transactions');
  };

  const handleOpenWithdrawModal = () => {
    setInitialTrxType('TARIK');
    setCurrentTab('transactions');
  };

  const handleOpenAddMemberModal = () => {
    setIsAddMemberOpen(true);
    setCurrentTab('members');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* Top Header */}
      <Header onToggleMobileMenu={() => setIsMobileMenuOpen(true)} />

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto transition-all">
          {currentTab === 'dashboard' && (
            <Dashboard
              onNavigateTab={handleSelectTab}
              onOpenDepositModal={handleOpenDepositModal}
              onOpenWithdrawModal={handleOpenWithdrawModal}
              onOpenAddMemberModal={handleOpenAddMemberModal}
            />
          )}

          {currentTab === 'members' && !isAnggota && (
            <Members
              onViewMemberCard={handleViewMemberCard}
              isAddModalOpenInitially={isAddMemberOpen}
              onCloseAddModalInitially={() => setIsAddMemberOpen(false)}
            />
          )}

          {currentTab === 'transactions' && (
            <Transactions
              initialModalType={initialTrxType}
              onCloseInitialModal={() => setInitialTrxType(null)}
            />
          )}

          {currentTab === 'reports' && !isAnggota && <Reports />}

          {currentTab === 'card' && (
            <MemberCardPage
              initialMember={selectedCardMember}
              onNavigateToVerify={id => setVerifyId(id)}
              onBack={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'profile' && <Profile />}

          {currentTab === 'settings' && user?.role === 'ADMIN' && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
