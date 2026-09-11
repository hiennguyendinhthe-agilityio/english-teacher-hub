import React, { useState } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { ShieldAlert, ArrowLeft, Loader2, Key } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { promoteToAdminWithSecret } from '../services/authService';

/**
 * ProtectedRoute: Enforces Authentication and Role-Based Access Control (RBAC).
 * 
 * Props:
 *  - children: Route content
 *  - requireAdmin: boolean (default true) — if true, checks user.publicMetadata.role === 'admin'
 */
export default function ProtectedRoute({ children, requireAdmin = true }) {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { user } = useUser();
  const { t } = useLanguage();
  const location = useLocation();

  const [adminSecret, setAdminSecret] = useState('');
  const [promoting, setPromoting] = useState(false);

  const handleSelfPromote = async () => {
    if (!adminSecret) return;
    setPromoting(true);
    try {
      const updatedUser = await promoteToAdminWithSecret(getToken, adminSecret);
      localStorage.setItem('db_role', updatedUser.role);
      alert('Success! You are now an Admin. The page will reload.');
      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setPromoting(false);
    }
  };

  // 1. Loading state with smooth animation
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">{t('adminLoading')}</p>
      </div>
    );
  }

  // 2. Authentication check - preserves target location in redirect_url
  if (!isSignedIn) {
    const target = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect_url=${target}`} replace />;
  }

  // 3. Authorization check (Admin role)
  const clerkRole = user?.publicMetadata?.role?.toLowerCase();
  const databaseRole = localStorage.getItem('db_role')?.toLowerCase();
  // Clerk metadata gives immediate UI feedback; the API independently verifies
  // the matching signed JWT claim before allowing any admin operation.
  const isAdmin = clerkRole === 'admin' || databaseRole === 'admin';
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background/95 p-4 sm:p-6 select-none animate-in fade-in zoom-in-95 duration-300">
        <div className="max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-destructive/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              {t('authAccessDeniedTitle')}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('authAccessDeniedDesc')}
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Button asChild className="w-full rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20">
              <Link to="/">
                <ArrowLeft className="w-4 h-4" />
                {t('authBackToHome')}
              </Link>
            </Button>

            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3 flex items-center justify-center gap-1.5">
                <Key size={14} /> System Setup
              </h3>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  value={adminSecret} 
                  onChange={e => setAdminSecret(e.target.value)} 
                  placeholder="Enter Setup Key" 
                  className="w-full text-sm px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none"
                  onKeyDown={e => e.key === 'Enter' && handleSelfPromote()}
                />
                <Button onClick={handleSelfPromote} disabled={promoting} className="rounded-xl px-4 font-bold">
                  {promoting ? <Loader2 size={16} className="animate-spin" /> : 'Go'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
