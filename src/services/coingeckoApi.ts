export interface CoingeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
}

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export async function fetchCoingeckoMarkets(ids: string[]): Promise<CoingeckoMarket[]> {
  if (ids.length === 0) return [];

  const params = new URLSearchParams({
    vs_currency: 'usd',
    ids: ids.join(','),
  });

  const url = `${COINGECKO_BASE}/coins/markets?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Coingecko error: ${res.status}`);
    }
    const data = (await res.json()) as CoingeckoMarket[];
    return data;
  } catch (err) {
    console.error('Failed to fetch coingecko markets', err);
    return [];
  }
}


