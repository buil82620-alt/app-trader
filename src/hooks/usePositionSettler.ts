import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useOrderResultStore } from '../stores/orderResultStore';
import { useContractStore } from '../stores/contractStore';

/**
 * Hook để tự động settle positions đã expire và hiển thị modal kết quả
 * Không đụng chạm tới TradingModal
 */
export function usePositionSettler() {
  const token = useAuthStore((s) => s.token);
  const currentPrice = useContractStore((s) => s.price);
  const symbol = useContractStore((s) => s.symbol);
  const { showResultModal } = useOrderResultStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const checkingRef = useRef(false);
  const shownPositionsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!token || !currentPrice || currentPrice === 0) return;

    const checkAndSettlePositions = async () => {
      // Prevent concurrent checks
      if (checkingRef.current) return;
      checkingRef.current = true;

      try {
        // Settle expired positions
        const settleRes = await fetch('/api/contract/settle-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            symbol,
            currentPrice,
          }),
        });

        const settleData = await settleRes.json();

        if (settleData.success && settleData.positions && settleData.positions.length > 0) {
          // For each settled position, fetch full details and show result modal
          for (const settledPosition of settleData.positions) {
            try {
              // Fetch full position details after settle
              await new Promise(resolve => setTimeout(resolve, 500)); // Wait a bit for DB to update

              const positionRes = await fetch(`/api/contract/positions?status=CLOSED`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const positionData = await positionRes.json();

              if (positionData.success && positionData.positions) {
                const fullPosition = positionData.positions.find(
                  (p: any) => p.id === settledPosition.id
                );

                if (fullPosition && !shownPositionsRef.current.has(fullPosition.id)) {
                  // Mark as shown to prevent duplicate modals
                  shownPositionsRef.current.add(fullPosition.id);

                  // Calculate handling fee (0.1% of amount)
                  const handlingFee = (fullPosition.amount * 0.1) / 100;

                  const result = {
                    positionId: fullPosition.id,
                    symbol: fullPosition.symbol,
                    side: fullPosition.side,
                    amount: fullPosition.amount,
                    entryPrice: fullPosition.entryPrice,
                    exitPrice: fullPosition.exitPrice || fullPosition.entryPrice,
                    duration: fullPosition.duration,
                    profitability: fullPosition.profitability,
                    actualProfit: fullPosition.actualProfit || 0,
                    result: fullPosition.result || 'LOSS',
                    handlingFee,
                    createdAt: fullPosition.createdAt,
                    closedAt: fullPosition.closedAt || fullPosition.createdAt,
                  };

                  // Show result modal
                  showResultModal(result);
                }
              }
            } catch (error) {
              console.error('Error fetching settled position details:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error checking and settling positions:', error);
      } finally {
        checkingRef.current = false;
      }
    };

    // Check immediately
    checkAndSettlePositions();

    // Then check every 2 seconds
    intervalRef.current = setInterval(checkAndSettlePositions, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [token, currentPrice, symbol, showResultModal]);
}

