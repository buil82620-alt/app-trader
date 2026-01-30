import { useEffect, useMemo } from 'react';
import { useAuthStore } from '../../../stores/authStore';
import ReferralHeader from './ReferralHeader';
import ReferralCard from './ReferralCard';

function buildInviteCode(userId: number | null, email: string | null): string {
  if (userId != null) {
    return userId.toString(36).toUpperCase().slice(0, 6).padEnd(6, 'X');
  }
  if (email) {
    const base = email.split('@')[0] || 'INVITE';
    return base.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 6).padEnd(6, 'X');
  }
  return '82VX5G';
}

export default function ReferralPage() {
  const { isLoggedIn, userId, email } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    }
  }, [isLoggedIn]);

  const inviteCode = useMemo(
    () => buildInviteCode(userId, email),
    [userId, email]
  );

  const inviteUrl = useMemo(() => {
    if (typeof window === 'undefined') return `https://example.com/register?invite_code=${inviteCode}`;
    const origin = window.location.origin;
    return `${origin}/register?invite_code=${inviteCode}`;
  }, [inviteCode]);

  return (
    <div className="min-h-screen bg-[#14181d] text-white">
      <ReferralHeader onBack={() => window.history.back()} />
      <ReferralCard inviteCode={inviteCode} inviteUrl={inviteUrl} />
    </div>
  );
}


