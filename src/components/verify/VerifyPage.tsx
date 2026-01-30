import VerifyHeader from './VerifyHeader';
import VerifyForm from './VerifyForm';
import FooterNav from '../shared/FooterNav';
import { useUserVerification } from '../../hooks/useUserVerification';
import { useAuthStore } from '../../stores/authStore';

export default function VerifyPage() {
  const { isVerified } = useAuthStore();
  
  // Check verification status periodically
  useUserVerification();

  // Show success message if already verified
  if (isVerified) {
    return (
      <div className="min-h-screen bg-gray-900 pb-16 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="mb-4">
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Account Verified</h2>
          <p className="text-gray-300 mb-6">Your account has been successfully verified!</p>
          <button
            onClick={() => window.location.href = '/contract'}
            className="px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600"
          >
            Continue Trading
          </button>
        </div>
        <FooterNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-16">
      <VerifyHeader />
      <VerifyForm />
      <FooterNav />
    </div>
  );
}


