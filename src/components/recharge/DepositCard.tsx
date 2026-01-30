import QRCode from 'react-qr-code';
import { useState, useEffect } from 'react';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface DepositCardProps {
  address?: string;
  asset?: string;
  network?: string;
}

export default function DepositCard({ address: propAddress, asset, network }: DepositCardProps) {
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState(propAddress || '');
  const [loading, setLoading] = useState(!propAddress);
  const { t } = useAppTranslation();

  useEffect(() => {
    // If address is provided as prop, use it
    if (propAddress) {
      setAddress(propAddress);
      setLoading(false);
      return;
    }

    // Otherwise, fetch from API
    if (asset && network) {
      const fetchAddress = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/deposit-addresses/get?asset=${asset}&network=${network}`);
          const data = await response.json();

          if (response.ok && data.data && data.data.length > 0) {
            setAddress(data.data[0].address);
          } else {
            setAddress('Address not available');
          }
        } catch (error) {
          console.error('Error fetching deposit address:', error);
          setAddress('Error loading address');
        } finally {
          setLoading(false);
        }
      };

      fetchAddress();
    }
  }, [propAddress, asset, network]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-3xl px-6 pt-6 pb-6 mb-6 flex flex-col items-center">
        <div className="text-gray-400">Loading address...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-3xl px-6 pt-6 pb-6 mb-6 flex flex-col items-center">
      {address && address !== 'Address not available' && address !== 'Error loading address' && (
        <div className="bg-white p-3 rounded-xl mb-4">
          <QRCode value={address} size={180} />
        </div>
      )}
      <p className="text-gray-200 text-sm mb-2">
        {t('rechargePage.depositCard.title')}
      </p>
      <p className="text-gray-100 text-xs text-center break-all mb-4">
        {address}
      </p>
      {address && address !== 'Address not available' && address !== 'Error loading address' && (
        <button
          type="button"
          onClick={handleCopy}
          className="w-full bg-emerald-400 text-gray-900 font-semibold py-2 rounded-full text-sm"
        >
          {copied
            ? t('rechargePage.depositCard.copied')
            : t('rechargePage.depositCard.copy')}
        </button>
      )}
    </div>
  );
}


