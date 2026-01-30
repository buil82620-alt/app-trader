import { useEffect, useRef } from 'react';
import { ColorType, createChart, type IChartApi, type ISeriesApi, type LineData } from 'lightweight-charts';

interface SparkPoint {
  time: number;
  value: number;
}

interface AssetListItemProps {
  symbol: string;
  pair: string;
  price: number;
  changePercent: number;
  trend: 'up' | 'down';
  logoUrl?: string;
  logoBgColor?: string;
  sparkline: SparkPoint[];
  variant?: 'default' | 'derivative';
  onClick?: () => void;
}

export default function AssetListItem({
  symbol,
  pair,
  price,
  changePercent,
  trend,
  logoUrl,
  logoBgColor = '#111827',
  sparkline,
  variant = 'default',
  onClick,
}: AssetListItemProps) {
  const isPositive = trend === 'up';
  const isDerivative = variant === 'derivative';
  const hasValidPrice = Number.isFinite(price) && price !== 0;
  const hasValidChange = Number.isFinite(changePercent);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 24,
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
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
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
    <div
      className={
        isDerivative
          ? 'bg-gray-800 px-4 py-3 flex items-center justify-between rounded-2xl mx-4 mb-3'
          : 'bg-gray-800 px-4 py-4 flex items-center justify-between rounded-2xl mx-4 mb-3'
      }
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Left */}
      {isDerivative ? (
        <div className="flex-1">
          <div className="text-white text-sm font-semibold">{symbol}</div>
          {hasValidPrice ? (
            <div className="text-white text-sm mt-1">
              {price.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}
            </div>
          ) : (
            <div className="mt-1 h-4 w-16 rounded-md bg-white/20 animate-pulse" />
          )}
        </div>
      ) : (
        <div className="flex items-center flex-1">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: logoBgColor }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={symbol}
                className="w-9 h-9 rounded-full object-contain"
              />
            ) : (
              <span className="text-white font-bold text-sm">{symbol[0]}</span>
            )}
          </div>
          <div>
            <div className="text-white font-medium text-base">{symbol}</div>
            <div className="text-gray-400 text-xs">{pair}</div>
          </div>
        </div>
      )}

      {/* Right: Price (for USDT) + Chart + Change */}
      <div className="flex items-center">
        {!isDerivative && (
          <div className="mr-4 text-right">
            {hasValidPrice ? (
              <div className="text-white font-medium text-lg">
                {price.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}
              </div>
            ) : (
              <div className="h-5 w-20 rounded-md bg-white/20 animate-pulse mb-1" />
            )}
            {hasValidChange ? (
              <div
                className={`flex items-center justify-end text-xs ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isPositive ? (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
                <span>{Math.abs(changePercent).toFixed(2)}%</span>
              </div>
            ) : (
              <div className="h-3 w-14 rounded-md bg-white/10 animate-pulse" />
            )}
          </div>
        )}

        {/* Mini Chart */}
        <div className="w-16 h-8 mr-2" ref={chartContainerRef} />

        {/* Change percent for Derivative style */}
        {isDerivative && (
          hasValidChange ? (
            <div
              className={`flex items-center text-xs ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isPositive ? (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              <span>{Math.abs(changePercent).toFixed(2)}%</span>
            </div>
          ) : (
            <div className="h-3 w-12 rounded-md bg-white/10 animate-pulse" />
          )
        )}
      </div>
    </div>
  );
}

