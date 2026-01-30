import { useEffect, useMemo, useState } from 'react';
import { fetchCoingeckoMarkets } from '../../services/coingeckoApi';
import { useAuthStore } from '../../stores/authStore';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import WithdrawHeader from './WithdrawHeader';
import WithdrawAssetList from './WithdrawAssetList';
import WithdrawForm from './WithdrawForm';
import { WITHDRAW_ASSETS } from './withdrawConfig';

function getSelectedCoinFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const sp = new URLSearchParams(window.location.search);
  const coin = sp.get('coin');
  return coin ? coin.toUpperCase() : null;
}

function setCoinParam(coin: string | null) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (!coin) url.searchParams.delete('coin');
  else url.searchParams.set('coin', coin);
  window.history.pushState({}, '', url.toString());
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function WithdrawPage() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { t } = useAppTranslation();
  const [selectedCoin, setSelectedCoin] = useState<string | null>(() => getSelectedCoinFromUrl());
  const [imageById, setImageById] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const onPop = () => setSelectedCoin(getSelectedCoinFromUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    (async () => {
      const ids = WITHDRAW_ASSETS.map((a) => a.coingeckoId);
      const data = await fetchCoingeckoMarkets(ids);
      const map: Record<string, string> = {};
      data.forEach((m) => {
        map[m.id] = m.image;
      });
      setImageById(map);
    })();
  }, []);

  const title = t('withdraw.headerTitle');

  const onBack = () => {
    if (selectedCoin) {
      setCoinParam(null);
      setSelectedCoin(null);
      return;
    }
    window.history.back();
  };

  const assets = useMemo(() => WITHDRAW_ASSETS, []);

  return (
    <div className="min-h-screen bg-[#1f252b]">
      <WithdrawHeader title={title} onBack={onBack} />

      {selectedCoin ? (
        <WithdrawForm coin={selectedCoin} />
      ) : (
        <WithdrawAssetList
          assets={assets}
          imageById={imageById}
          onSelect={(sym) => {
            setCoinParam(sym);
            setSelectedCoin(sym);
          }}
        />
      )}
    </div>
  );
}


