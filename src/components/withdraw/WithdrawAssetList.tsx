import WithdrawAssetItem from './WithdrawAssetItem';
import type { WithdrawAsset } from './withdrawConfig';
import { useAppTranslation } from '../../hooks/useAppTranslation';

interface Props {
  assets: WithdrawAsset[];
  imageById: Record<string, string | undefined>;
  onSelect: (symbol: string) => void;
}

export default function WithdrawAssetList({ assets, imageById, onSelect }: Props) {
  const { t } = useAppTranslation();

  return (
    <div className="pt-1">
      {assets.map((a) => (
        <WithdrawAssetItem
          key={a.symbol}
          name={t('withdraw.assetLabel', { symbol: a.symbol })}
          imageUrl={imageById[a.coingeckoId]}
          onClick={() => onSelect(a.symbol)}
        />
      ))}
    </div>
  );
}


