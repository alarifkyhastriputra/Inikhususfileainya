import React, { useState, useEffect } from 'react';
import { UserProfile, GeneratedWebsite } from './types';
import { getUserWebsites, getActiveSession, setActiveSession, isAdminEmail } from './lib/firebase';
import { AuthModal } from './components/AuthModal';
import { PendingApprovalView } from './components/PendingApprovalView';
import { WizardMaster } from './components/Wizard/WizardMaster';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { MyProjectsModal } from './components/MyProjectsModal';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getActiveSession());
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);

  // Websites & Selected Website
  const [websites, setWebsites] = useState<GeneratedWebsite[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<GeneratedWebsite | null>(null);

  useEffect(() => {
    // 1. Sync local users to server database on app mount
    try {
      const raw = localStorage.getItem('vimos_local_users_db_v1') || localStorage.getItem('vimos_local_users');
      const localUsers = raw ? JSON.parse(raw) : [];
      if (Array.isArray(localUsers) && localUsers.length > 0) {
        fetch('/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users: localUsers })
        }).catch(() => {});
      }
    } catch {}

    // 2. If session exists, load user's isolated websites and refresh user profile data
    if (userProfile && userProfile.email) {
      loadUserWebsites(userProfile.email);

      // Verify and refresh user profile with online server
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.users)) {
            const current = data.users.find((u: any) => u.email.toLowerCase() === userProfile.email.toLowerCase());
            if (current) {
              const effective: UserProfile = {
                ...current,
                role: isAdminEmail(current.email) ? 'admin' : current.role,
                status: isAdminEmail(current.email) ? 'active' : current.status,
              };
              setUserProfile(effective);
              setActiveSession(effective);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const loadUserWebsites = async (email: string) => {
    if (!email) return;
    try {
      const sites = await getUserWebsites(email);
      setWebsites(sites);
    } catch (err) {
      console.warn('Failed to load user websites:', err);
    }
  };

  const handleLogout = async () => {
    setActiveSession(null);
    setUserProfile(null);
    setWebsites([]);
    setSelectedWebsite(null);
    setShowAuthModal(true);
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-zinc-800 border-t-white rounded-full animate-spin" />
          <div className="text-xs text-zinc-400 font-mono">Loading vimos.ai...</div>
        </div>
      </div>
    );
  }

  // Initial view is Login / Register if user not authenticated
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <AuthModal
          isOpen={true}
          onClose={() => {}}
          initialError={authError}
          onSuccess={(profile) => {
            const effectiveProfile: UserProfile = {
              ...profile,
              role: isAdminEmail(profile.email) ? 'admin' : profile.role,
              status: isAdminEmail(profile.email) ? 'active' : profile.status,
            };
            setUserProfile(effectiveProfile);
            setActiveSession(effectiveProfile);
            setShowAuthModal(false);
            setAuthError(null);
            loadUserWebsites(effectiveProfile.email);
          }}
        />
      </div>
    );
  }

  const isCurrentUserAdmin = userProfile.role === 'admin' || isAdminEmail(userProfile.email);
  const effectiveProfile: UserProfile = {
    ...userProfile,
    role: isCurrentUserAdmin ? 'admin' : userProfile.role,
    status: isCurrentUserAdmin ? 'active' : userProfile.status,
  };

  // Account pending approval view
  if (effectiveProfile.status === 'pending' && !isCurrentUserAdmin) {
    return (
      <PendingApprovalView
        user={effectiveProfile}
        onRefresh={(updated) => setUserProfile(updated)}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <WizardMaster
        user={effectiveProfile}
        onUpdateUser={(updated) => {
          setUserProfile(updated);
          setActiveSession(updated);
        }}
        onOpenAdmin={() => setShowAdminModal(true)}
        onOpenProjects={() => {
          loadUserWebsites(effectiveProfile.email);
          setShowProjectsModal(true);
        }}
        onLogout={handleLogout}
        loadedWebsite={selectedWebsite}
        websites={websites}
        onRefreshWebsites={() => loadUserWebsites(effectiveProfile.email)}
      />

      {/* Admin Dashboard Modal */}
      {isCurrentUserAdmin && (
        <AdminDashboardModal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          currentUserProfile={effectiveProfile}
          websites={websites}
        />
      )}

      {/* My Projects Modal - Strictly user-isolated */}
      <MyProjectsModal
        isOpen={showProjectsModal}
        onClose={() => setShowProjectsModal(false)}
        websites={websites}
        currentUserEmail={effectiveProfile.email}
        onSelectProject={(site) => {
          setSelectedWebsite({ ...site, html: site.html });
          setShowProjectsModal(false);
        }}
        onRefresh={() => loadUserWebsites(effectiveProfile.email)}
      />
    </div>
  );
}
