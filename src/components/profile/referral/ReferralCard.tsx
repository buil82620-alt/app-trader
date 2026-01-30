import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { useAppTranslation } from '../../../hooks/useAppTranslation';

interface Props {
  inviteCode: string;
  inviteUrl: string;
}

export default function ReferralCard({ inviteCode, inviteUrl }: Props) {
  const [copied, setCopied] = useState(false);
  const [QRCodeComp, setQRCodeComp] =
    useState<ComponentType<{ value: string; size?: number }> | null>(null);

  useEffect(() => {
    let mounted = true;
    import('react-qr-code')
      .then((mod) => {
        if (mounted) {
          setQRCodeComp(() => mod.default as any);
        }
      })
      .catch(() => {
        // ignore, không render QR nếu lỗi
      });
    return () => {
      mounted = false;
    };
  }, []);

  const { t } = useAppTranslation();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-6 px-4">
      <div className="bg-[#3b4338] rounded-3xl px-6 pt-6 pb-8 flex flex-col items-center shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
        <div className="text-emerald-400 text-lg mb-1">
          {t('profile.referral.invitationCode')}
        </div>
        <div className="text-white text-lg font-semibold tracking-[0.2em] mb-5">
          {inviteCode}
        </div>

        {QRCodeComp && (
          <div className="bg-white p-3 rounded-xl mb-5">
            <QRCodeComp value={inviteUrl} size={210} />
          </div>
        )}

        <p className="text-gray-200 text-xs text-center leading-snug mb-4 break-all">
          {inviteUrl}
        </p>

        <button
          type="button"
          onClick={handleCopy}
          className="mt-1 w-40 h-11 rounded-md bg-[#7cf03a] text-gray-900 font-semibold text-sm active:scale-[0.97] transition-transform duration-150"
        >
          {copied ? 'Copied!' : t('profile.referral.copyAddress')}
        </button>
      </div>
    </div>
  );
}


