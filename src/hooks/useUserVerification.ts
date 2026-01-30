import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook to periodically check and update user verification status
 * This ensures the app stays in sync when admin approves verification
 */
export function useUserVerification() {
  const { userId, token, isVerified, updateVerificationStatus } = useAuthStore();

  useEffect(() => {
    if (!userId || !token) return;

    const checkVerificationStatus = async () => {
      try {
        const response = await fetch('/api/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const newVerifiedStatus = data.data?.isVerified ?? false;
          
          // Only update if status changed
          if (newVerifiedStatus !== isVerified) {
            updateVerificationStatus(newVerifiedStatus);
            console.log('Verification status updated:', newVerifiedStatus);
            
            // Show notification if user just got verified
            if (newVerifiedStatus && !isVerified) {
              // You can add a toast notification here
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Account Verified', {
                  body: 'Your account has been verified successfully!',
                  icon: '/favicon.ico',
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };

    // Check immediately
    checkVerificationStatus();

    // Check every 30 seconds
    const interval = setInterval(checkVerificationStatus, 30000);

    return () => clearInterval(interval);
  }, [userId, token, isVerified, updateVerificationStatus]);
}

