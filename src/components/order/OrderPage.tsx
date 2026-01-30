import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import OrderHeader from './OrderHeader';
import OrderTabs, { type OrderTabKey } from './OrderTabs';
import OrderEmpty from './OrderEmpty';
import OrderItem, { type OrderRecord } from './OrderItem';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function OrderPage() {
  const { t } = useAppTranslation();
  const [tab, setTab] = useState<OrderTabKey>('in_transaction');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const status = tab === 'in_transaction' ? 'in_transaction' : 'position_closed';
        const res = await fetch(`/api/order/list?status=${status}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [tab, token]);

  return (
    <div className="min-h-screen">
      <OrderHeader title={t('order.headerTitle')} />

      <div className="px-4 pt-2">
        <OrderTabs value={tab} onChange={setTab} />
      </div>

      <div className="px-4 pt-6 pb-24">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : orders.length === 0 ? (
          <OrderEmpty />
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <OrderItem key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


