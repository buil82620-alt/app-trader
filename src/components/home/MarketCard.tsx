import { useEffect, useRef } from 'react';
import { ColorType, createChart, type IChartApi, type ISeriesApi, type LineData } from 'lightweight-charts';

interface SparkPoint {
  time: number;
  value: number;
}

interface MarketCardProps {
  symbol: string;
  price: number;
  changePercent: number;
  trend: 'up' | 'down';
  sparkline: SparkPoint[];
}

export default function MarketCard({ symbol, price, changePercent, trend, sparkline }: MarketCardProps) {
  const hasValidPrice = Number.isFinite(price) && price !== 0;
  const hasValidChange = Number.isFinite(changePercent);
  const isPositive = trend === 'up';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 32,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: false },
      timeScale: {
        visible: false,
        borderVisible: false,
      },
      handleScale: false,
      handleScroll: false,
    });

    const areaSeries = chart.addAreaSeries({
      lineColor: isPositive ? '#10b981' : '#ef4444',
      topColor: isPositive ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)',
      bottomColor: 'rgba(0,0,0,0)',
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = areaSeries;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [isPositive]);

  useEffect(() => {
    if (!seriesRef.current) return;
    const data: LineData[] = sparkline.map((p) => ({ time: p.time as any, value: p.value }));
    seriesRef.current.setData(data);
  }, [sparkline]);

  return (
    <div className="min-w-[140px] bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-4 mr-3 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-sm font-medium">{symbol}</span>
      </div>

      {/* Mini Chart */}
      <div className="h-8 mb-2 relative" ref={containerRef} />

      {/* Price */}
      {hasValidPrice ? (
        <div className="text-white text-lg font-bold mb-1">
          {price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ) : (
        <div className="h-5 w-24 rounded-md bg-white/20 animate-pulse mb-1" />
      )}

      {/* Change Percent */}
      {hasValidChange ? (
        <div
          className={`flex items-center text-sm ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {isPositive ? (
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
          <span>{Math.abs(changePercent).toFixed(2)}%</span>
        </div>
      ) : (
        <div className="h-4 w-16 rounded-md bg-white/10 animate-pulse" />
      )}
    </div>
  );
}

