import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, UTCTimestamp } from 'lightweight-charts';

interface CandlestickChartProps {
  data: Array<{ time: number; open: number; high: number; low: number; close: number; volume: number }>;
  currentPrice: number;
  timeframe: string;
}

export default function CandlestickChart({ data, currentPrice, timeframe }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const priceLineRef = useRef<ReturnType<ISeriesApi<'Candlestick'>['createPriceLine']> | null>(null);

  // Helper to slice raw candles depending on timeframe
  const sliceCandles = (
    raw: Array<{ time: number; open: number; high: number; low: number; close: number; volume: number }>
  ) => {
    if (raw.length === 0) return raw;

    const shortTimeframes = ['1m', '5m', '15m', '30m'];
    if (shortTimeframes.includes(timeframe)) {
      // For lower timeframes, always keep the latest 31 candles
      return raw.slice(-31);
    }

    // For higher timeframes, keep last 30 minutes of data (if applicable)
    const latestTime = raw[raw.length - 1].time;
    const cutoff = latestTime - 30 * 60; // 30 minutes in seconds
    return raw.filter((candle) => candle.time >= cutoff);
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#111827' },
        textColor: '#9ca3af',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'transparent', style: 1, visible: true },
        horzLines: { color: 'transparent', style: 1, visible: true },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: '#374151',
          width: 1,
          style: 1,
        },
        horzLine: {
          color: '#ffffff',
          width: 1,
          style: 2, // Dashed
        },
      },
      rightPriceScale: {
        borderColor: '#374151',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        entireTextOnly: false,
        ticksVisible: true,
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
    });

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: 6,
        minMove: 0.000001,
      },
    });

    // Initial data for chart
    const initialData = sliceCandles(data);

    const formattedData: CandlestickData[] = initialData.map((candle) => ({
      time: candle.time as UTCTimestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    candlestickSeries.setData(formattedData);

    // Add horizontal line for current price (dashed line)
    priceLineRef.current = candlestickSeries.createPriceLine({
      price: currentPrice,
      color: '#ffffff',
      lineWidth: 1,
      lineStyle: 2, // Dashed
      axisLabelVisible: true,
      title: currentPrice.toFixed(6),
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  // Update data when it changes
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      const slicedData = sliceCandles(data);

      const formattedData: CandlestickData[] = slicedData.map((candle) => ({
        time: candle.time as UTCTimestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));

      seriesRef.current.setData(formattedData);
    }
  }, [data, timeframe]);

  // Update price line when current price changes
  useEffect(() => {
    if (seriesRef.current && currentPrice) {
      // Remove existing price line if it exists
      if (priceLineRef.current) {
        seriesRef.current.removePriceLine(priceLineRef.current);
      }

      // Create new price line
      priceLineRef.current = seriesRef.current.createPriceLine({
        price: currentPrice,
        color: '#ffffff',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: currentPrice.toFixed(6),
      });
    }
  }, [currentPrice]);

  return (
    <div className="bg-gray-900 px-4 py-4">
      <div ref={chartContainerRef} className="w-full" style={{ height: '400px' }} />
    </div>
  );
}
